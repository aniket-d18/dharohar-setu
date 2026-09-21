import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtUserPayload {
  id: string;
  email: string;
  role: 'CONTRIBUTOR' | 'REVIEWER' | 'STEWARD' | 'EXPERT' | 'ADMIN';
  displayName?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authentication token missing. Please log in.');
    }

    const parts = authHeader.trim().split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization format. Expected "Bearer <token>".');
    }

    const token = parts[1];

    try {
      const secret = process.env.JWT_SECRET || 'dev-fallback-secret-key-change-in-env-32chars';
      const decoded: any = await this.jwtService.verifyAsync(token, { secret });

      // Attach strongly-typed verified user payload to the request
      request.user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role,
        displayName: decoded.displayName,
      };

      return true;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Session token expired. Please log in again.');
      }
      throw new UnauthorizedException('Invalid cryptographic token signature.');
    }
  }
}
