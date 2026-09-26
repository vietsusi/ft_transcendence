import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
describe('chat request boundary', () => {
  const service = new ChatService({} as PrismaService);
  it('rejects empty messages before DB/model access', async () => {
    await expect(
      service.reply({ messages: [] }, 1, new AbortController().signal),
    ).rejects.toThrow('Send 1–24');
  });
  it('rejects messages ending with assistant', async () => {
    await expect(
      service.reply(
        {
          messages: [
            { role: 'assistant', parts: [{ type: 'text', text: 'hello' }] },
          ],
        },
        1,
        new AbortController().signal,
      ),
    ).rejects.toThrow('A user question');
  });
  it('rejects excessive text', async () => {
    await expect(
      service.reply(
        {
          messages: [
            { role: 'user', parts: [{ type: 'text', text: 'x'.repeat(4001) }] },
          ],
        },
        1,
        new AbortController().signal,
      ),
    ).rejects.toThrow('Send 1–24');
  });
});
