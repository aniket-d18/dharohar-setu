import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUserPayload } from '../guards/jwt-auth.guard';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
