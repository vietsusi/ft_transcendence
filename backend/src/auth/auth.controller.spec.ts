import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController session contract', () => {
  let controller: AuthController;
  const auth = { login: jest.fn(), verify: jest.fn() };
  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: auth }],
    }).compile();
    controller = module.get(AuthController);
  });
  it('forwards login credentials and preserves the preference profile', async () => {
    const result = {
      token: 'token',
      user: { id: 7, preferredGenres: ['Drama'] },
    };
    auth.login.mockResolvedValue(result);
    expect(
      await controller.login({
        email: 'qa@example.test',
        password: 'test-password',
      }),
    ).toEqual(result);
    expect(auth.login).toHaveBeenCalledWith('qa@example.test', 'test-password');
  });
  it('verifies the JWT subject without accepting a client user id', async () => {
    auth.verify.mockResolvedValue({ id: 7, preferredGenres: ['Comedy'] });
    expect(await controller.verify({ user: { id: 7 } })).toEqual({
      id: 7,
      preferredGenres: ['Comedy'],
    });
    expect(auth.verify).toHaveBeenCalledWith(7);
  });
});
