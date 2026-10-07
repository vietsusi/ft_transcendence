import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService recommendation session compatibility', () => {
  let service: AuthService;
  const users = { findByEmail: jest.fn(), findById: jest.fn() };
  const jwt = { sign: jest.fn().mockReturnValue('signed-token') };
  let passwordHash: string;
  beforeAll(async () => {
    passwordHash = await bcrypt.hash('test-password', 4);
  });
  beforeEach(async () => {
    jest.clearAllMocks();
    users.findByEmail.mockResolvedValue({
      id: 7,
      email: 'qa@example.test',
      password: passwordHash,
    });
    users.findById.mockResolvedValue({
      id: 7,
      email: 'qa@example.test',
      preferredGenres: ['Drama'],
    });
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });
  it('returns stored preferences and signs the same subject used by recommendations', async () => {
    expect(await service.login('qa@example.test', 'test-password')).toEqual({
      token: 'signed-token',
      user: { id: 7, email: 'qa@example.test', preferredGenres: ['Drama'] },
    });
    expect(jwt.sign).toHaveBeenCalledWith({ sub: 7, email: 'qa@example.test' });
  });
  it('rejects invalid passwords without signing tokens', async () => {
    await expect(service.login('qa@example.test', 'incorrect')).rejects.toThrow(
      'Invalid credentials',
    );
    expect(jwt.sign).not.toHaveBeenCalled();
  });
  it('rejects unknown accounts without signing tokens', async () => {
    users.findByEmail.mockResolvedValue(null);
    await expect(
      service.login('missing@example.test', 'test-password'),
    ).rejects.toThrow('Invalid credentials');
    expect(jwt.sign).not.toHaveBeenCalled();
  });
  it('reloads current preferences on session verification', async () => {
    expect(await service.verify(7)).toMatchObject({
      preferredGenres: ['Drama'],
    });
    expect(users.findById).toHaveBeenCalledWith(7);
  });
});
