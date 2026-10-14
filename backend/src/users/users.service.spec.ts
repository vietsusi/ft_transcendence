import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService preference persistence', () => {
  let service: UsersService;
  const prisma = { user: { update: jest.fn(), findUnique: jest.fn() } };
  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(UsersService);
  });
  it('persists genres without returning the password', async () => {
    prisma.user.update.mockResolvedValue({
      id: 7,
      password: 'private-hash',
      preferredGenres: ['Drama'],
    });
    const result = await service.updateGenres(7, ['Drama']);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { preferredGenres: ['Drama'] },
    });
    expect(result).toEqual({ id: 7, preferredGenres: ['Drama'] });
  });
  it('supports clearing preferences for discovery recommendations', async () => {
    prisma.user.update.mockResolvedValue({
      id: 7,
      password: 'private-hash',
      preferredGenres: [],
    });
    expect(await service.updateGenres(7, [])).toEqual({
      id: 7,
      preferredGenres: [],
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { preferredGenres: [] },
    });
  });
  it('retains genres and omits passwords in session profiles', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 7,
      password: 'private-hash',
      preferredGenres: ['Comedy'],
    });
    expect(await service.findById(7)).toEqual({
      id: 7,
      preferredGenres: ['Comedy'],
    });
  });
  it('rejects nonexistent session subjects', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.findById(7)).rejects.toThrow('User not found');
  });
});
