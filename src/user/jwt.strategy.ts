import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) throw new Error('JWT_ACCESS_SECRET não definido');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    if (payload.sid) {
      const session = await this.prisma.refreshToken.findUnique({
        where: { id: Number(payload.sid) },
        select: { id: true, userId: true, revoked: true, expiresAt: true },
      });

      if (!session) throw new UnauthorizedException('Sessão não encontrada');
      if (session.revoked) throw new UnauthorizedException('Sessão revogada');
      if (session.expiresAt <= new Date()) throw new UnauthorizedException('Sessão expirada');
      if (session.userId !== payload.sub) throw new UnauthorizedException('Sessão inválida para o token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
      },
    });

    if (!user) throw new UnauthorizedException('Usuário do token não existe');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
    };
  }
}