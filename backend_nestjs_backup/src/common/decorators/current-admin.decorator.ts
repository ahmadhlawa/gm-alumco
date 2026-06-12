import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtAdmin } from '../../auth/interfaces/jwt-admin.interface';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtAdmin => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user as JwtAdmin;
  },
);
