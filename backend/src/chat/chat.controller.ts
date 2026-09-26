import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatFailure, abortable } from './chat.generation';

export function chatError(error: unknown, timedOut: boolean): string {
  if (timedOut)
    return 'TIMEOUT: The answer took too long. Please retry with a narrower question.';
  if (error instanceof ChatFailure && error.code === 'CONTENT_REJECTED')
    return 'CONTENT_REJECTED: A generated paragraph could not be verified against the catalog and was withheld. Please rephrase your question.';
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error.statusCode === 429
  )
    return 'PROVIDER_RATE_LIMIT: The model is busy. Please wait before retrying.';
  return 'PROVIDER_ERROR: The model could not complete a valid answer. Please retry later.';
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}
  private readonly timeoutMs = 90_000;
  @Get('status') status() {
    return this.chat.status();
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async send(
    @Body() body: unknown,
    @Req() req: Request & { user: { id: number } },
    @Res() res: Response,
  ) {
    this.chat.validate(body);
    if (!this.chat.status().configured)
      throw new ServiceUnavailableException('The model is not configured.');
    const release = this.chat.acquire(req.user.id);
    const abort = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      abort.abort(new ChatFailure('TIMEOUT'));
    }, this.timeoutMs);
    const onClose = () => {
      if (!res.writableEnded) abort.abort();
    };
    res.on('close', onClose);
    try {
      const {
        createUIMessageStream,
        JsonToSseTransformStream,
        UI_MESSAGE_STREAM_HEADERS,
      } = await import('ai');
      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          writer.write({ type: 'start' });
          writer.write({ type: 'text-start', id: 'answer' });
          try {
            const result = await abortable(
              this.chat.reply(
                body,
                req.user.id,
                abort.signal,
                (delta) => {
                  if (!abort.signal.aborted)
                    writer.write({ type: 'text-delta', id: 'answer', delta });
                },
                (stage) => {
                  if (!abort.signal.aborted)
                    writer.write({
                      type: 'data-progress',
                      data: { stage },
                      transient: true,
                    });
                },
              ),
              abort.signal,
            );
            if (abort.signal.aborted) return;
            if (result.mode === 'demo')
              writer.write({
                type: 'text-delta',
                id: 'answer',
                delta: result.text,
              });
            writer.write({
              type: 'data-catalog',
              data: { movies: result.movies, mode: result.mode },
            });
            writer.write({ type: 'text-end', id: 'answer' });
            writer.write({ type: 'finish', finishReason: 'stop' });
          } catch (error) {
            if (!res.destroyed) {
              writer.write({ type: 'text-end', id: 'answer' });
              writer.write({
                type: 'error',
                errorText: chatError(error, timedOut),
              });
              writer.write({ type: 'finish', finishReason: 'error' });
            }
          }
        },
        onError: () => 'PROVIDER_ERROR: Unable to complete the answer.',
      }).pipeThrough(new JsonToSseTransformStream());
      res.set(UI_MESSAGE_STREAM_HEADERS);
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();
      const reader = stream.getReader();
      // Unlike a drain-only pipe, disconnect also unblocks backpressure waits.
      try {
        while (!res.destroyed) {
          const next = await reader.read();
          if (next.done || res.destroyed) break;
          if (!res.write(next.value))
            await new Promise<void>((resolve) => {
              const done = () => {
                res.off('drain', done);
                res.off('close', done);
                resolve();
              };
              res.once('drain', done);
              res.once('close', done);
            });
        }
      } finally {
        await reader.cancel();
      }
      if (!res.destroyed) res.end();
    } finally {
      clearTimeout(timer);
      abort.abort();
      res.off('close', onClose);
      release();
    }
  }
}
