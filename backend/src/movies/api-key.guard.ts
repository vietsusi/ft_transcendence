import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

// Protects public write endpoints with a shared API key sent as the x-api-key header.
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header = request.headers['x-api-key'];
    const apiKey = Array.isArray(header) ? header[0] : header;
    const expected = process.env.API_KEY;
    if (!expected || !apiKey || apiKey !== expected) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }
}
