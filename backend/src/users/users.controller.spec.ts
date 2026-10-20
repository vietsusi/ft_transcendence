import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController preference contract', () => {
  let controller: UsersController;
  const users = { updateGenres: jest.fn(), findById: jest.fn() };
  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: users }],
    }).compile();
    controller = module.get(UsersController);
  });
  it('saves preferences for the authenticated subject', async () => {
    users.updateGenres.mockResolvedValue({
      id: 7,
      preferredGenres: ['Sci-Fi'],
    });
    expect(
      await controller.updateGenres(
        { user: { id: 7 } },
        { genres: ['Sci-Fi'] },
      ),
    ).toEqual({ id: 7, preferredGenres: ['Sci-Fi'] });
    expect(users.updateGenres).toHaveBeenCalledWith(7, ['Sci-Fi']);
  });
  it('loads the profile of the authenticated subject', async () => {
    users.findById.mockResolvedValue({ id: 7, preferredGenres: [] });
    expect(await controller.getMe({ user: { id: 7 } })).toEqual({
      id: 7,
      preferredGenres: [],
    });
    expect(users.findById).toHaveBeenCalledWith(7);
  });
});
