import { Controller, Post, Get, Body, Headers, UnauthorizedException, Inject } from '@nestjs/common';
import { AuthService, LoginDto } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('seed-users')
  async getDemoUsers() {
    return this.authService.getDemoUsers();
  }

  @Get('me')
  async getMe(@Headers('x-user-id') userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Missing x-user-id header');
    }
    return this.authService.getProfile(userId);
  }
}
