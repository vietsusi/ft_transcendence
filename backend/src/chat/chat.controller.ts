import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}
  @Get('status') status() {
    return this.chat.status();
  }
  @Post()
  async send(
    @Body() body: unknown,
    @Req() req: Request & { user: { id: number } },
    @Res() res: Response,
  ) {
    const abort = new AbortController();
    const onClose = () => {
      if (!res.writableEnded) abort.abort();
    };
    res.on('close', onClose);
    try {
      const result = await this.chat.reply(body, req.user.id, abort.signal);
      if (abort.signal.aborted) return;
      const { createUIMessageStream, pipeUIMessageStreamToResponse } =
        await import('ai');
      const stream = createUIMessageStream({
        execute: ({ writer }) => {
          writer.write({ type: 'start' });
          writer.write({ type: 'text-start', id: 'answer' });
          writer.write({
            type: 'text-delta',
            id: 'answer',
            delta: result.text,
          });
          writer.write({ type: 'text-end', id: 'answer' });
          writer.write({
            type: 'data-catalog',
            data: { movies: result.movies, mode: result.mode },
          });
        },
      });
      await pipeUIMessageStreamToResponse({ response: res, stream });
    } finally {
      res.off('close', onClose);
    }
  }
}
