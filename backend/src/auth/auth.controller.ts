import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtAdmin } from './interfaces/jwt-admin.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);
    response.cookie(this.cookieName, result.token, this.cookieOptions);
    return { admin: result.admin };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentAdmin() admin: JwtAdmin) {
    return { admin };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(this.cookieName, this.cookieOptions);
    return { message: 'Logged out successfully' };
  }

  private get cookieName() {
    return this.configService.get<string>(
      'JWT_COOKIE_NAME',
      'ofok_admin_token',
    );
  }

  private get cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: this.configService.get<number>('JWT_COOKIE_MAX_AGE_MS', 900000),
    };
  }
}
