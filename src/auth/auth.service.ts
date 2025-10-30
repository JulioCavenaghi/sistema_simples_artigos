import { Injectable, UnauthorizedException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    return user;
  }

  async signAccessToken(userId: number, sessionId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, roleId: true },
    });
    const payload: any = { sub: userId, roleId: user?.roleId ?? null };
    if (sessionId) payload.sid = sessionId;
    return this.jwtService.sign(payload);
  }

  private generateRefreshTokenPlain() {
    const token = randomBytes(64).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return { token, tokenHash };
  }

  async createSession(userId: number) {
    const { token, tokenHash } = this.generateRefreshTokenPlain();
    const expiresAt = add(new Date(), {
      days: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '30', 10),
    });

    const created = await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
        revoked: false,
      },
    });

    return { refreshToken: token, refreshTokenId: created.id, expiresAt };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const session = await this.createSession(user.id);

    const accessToken = await this.signAccessToken(user.id, session.refreshTokenId);

    return {
      accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      user: { id: user.id, email: user.email, name: user.name, roleId: user.roleId },
    };
  }

  async rotateRefreshToken(oldTokenPlain: string) {
    const tokenHash = createHash('sha256').update(oldTokenPlain).digest('hex');
    const existing = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!existing) throw new UnauthorizedException('Refresh token inválido');

    await this.prisma.refreshToken.update({ where: { id: existing.id }, data: { revoked: true } });

    const { token, tokenHash: newHash } = this.generateRefreshTokenPlain();
    const expiresAt = add(new Date(), { days: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '30', 10) });

    const created = await this.prisma.refreshToken.create({
      data: { tokenHash: newHash, userId: existing.userId, expiresAt, revoked: false },
    });

    const accessToken = await this.signAccessToken(existing.userId, created.id);
    return { accessToken, refreshToken: token };
  }

  async logout(refreshTokenPlain: string): Promise<number> {
    const tokenHash = createHash('sha256').update(refreshTokenPlain).digest('hex');

    const result = await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revoked: false },
      data: { revoked: true },
    });

    return result.count;
  }
}