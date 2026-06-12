import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminsService } from '../admins/admins.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const admin = await this.adminsService.findByEmail(dto.email);
    const passwordMatches = admin
      ? await bcrypt.compare(dto.password, admin.passwordHash)
      : false;

    if (!admin || !admin.isActive || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const expiresIn = this.configService.get<string>(
      'JWT_EXPIRES_IN',
      '15m',
    ) as JwtSignOptions['expiresIn'];
    const token = await this.jwtService.signAsync(
      { sub: admin.id, email: admin.email, role: admin.role },
      { expiresIn },
    );

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }
}
