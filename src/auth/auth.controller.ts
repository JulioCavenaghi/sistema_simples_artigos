import { Controller, Post, Body, HttpCode, Req, Res, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../user/dto/user.dto';
import { Public } from '../user/decorators/public.decorator';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: ExpressResponse) {
    const { accessToken, refreshToken, user } = await this.authService.login(body.email, body.password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    } );

    return { accessToken, user };
  }

  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: ExpressResponse) {
    const token = (req as any).cookies?.refreshToken;
    if (!token) throw new BadRequestException('Token não informado');

    const { accessToken, refreshToken } = await this.authService.rotateRefreshToken(token);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    } );

    return { accessToken };
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: ExpressResponse) {
    const token = (req as any).cookies?.refreshToken;
    if (token) await this.authService.logout(token);

    res.clearCookie('refreshToken', { path: '/' });
    return { ok: true };
  }
}