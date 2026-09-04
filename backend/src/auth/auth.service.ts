import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

async register(username: string, email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const user = await this.usersService.create(username, email, password);
    const fullUser = await this.usersService.findById(user.id);
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      token,
      user: fullUser,
    };
  }

async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const fullUser = await this.usersService.findById(user.id);
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      token,
      user: fullUser,
    };
  }

  async verify(userId: number) {
  return this.usersService.findById(userId);
  }
}