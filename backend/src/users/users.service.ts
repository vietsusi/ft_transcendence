import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(username: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error('Current password is incorrect');
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updated = await this.prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  
  const { password, ...result } = updated;
  return result;
  }

  async updateGenres(userId: number, genres: string[]) {
  const updated = await this.prisma.user.update({
    where: { id: userId },
    data: { preferredGenres: genres },
  });
  const { password, ...result } = updated;
  return result;
  }

  async findById(userId: number) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  const { password, ...result } = user;
  return result;
  }

  async updateAvatar(userId: number, avatarUrl: string) {
  const updated = await this.prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
  });
  const { password, ...result } = updated;
  return result;
  }
}