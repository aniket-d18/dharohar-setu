import { Controller, Post, Get, Body, Headers, UnauthorizedException, Inject, UseGuards, Req } from '@nestjs/common';
import { AuthService, LoginDto } from './auth.service';
import { JwtAuthGuard, JwtUserPayload } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: JwtUserPayload) {
    return this.authService.getProfile(user.id);
  }
}
