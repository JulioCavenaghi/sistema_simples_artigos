import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureAdmin(requesterId?: number) {
    if (!requesterId) throw new UnauthorizedException('Solicitante não autenticado');

    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      include: { role: true },
    });

    if (!requester) throw new NotFoundException('Solicitante não encontrado');
    if (requester.role?.name !== 'ADMIN') throw new ForbiddenException('Acesso negado');

    return requester;
  }

  async register(requesterId: number, email: string, password: string, name?: string, roleId?: number) {
    await this.ensureAdmin(requesterId);

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email já está registrado');

    if (!roleId) throw new ConflictException('roleId deve ser informado');

    const targetRole = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!targetRole) throw new NotFoundException('Role informada não encontrada');

    const hashed = await bcrypt.hash(password, 12);
    return this.prisma.user.create({
      data: { email, password: hashed, name, roleId: targetRole.id },
      select: { id: true, email: true, name: true, roleId: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(requesterId: number, id: number) {
    await this.ensureAdmin(requesterId);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, roleId: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async getAllUsers(requesterId?: number) {
    await this.ensureAdmin(requesterId);

    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, roleId: true },
    });
  }

  async updateUser(requesterId: number, targetId: number, updates: UpdateUserDto) {
    await this.ensureAdmin(requesterId);

    const user = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (updates.email && updates.email !== user.email) {
      const exists = await this.prisma.user.findUnique({ where: { email: updates.email } });
      if (exists) throw new ConflictException('Email já está registrado');
    }

    const data: any = {};
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.email !== undefined) data.email = updates.email;
    if (updates.password !== undefined && updates.password !== '') {
      data.password = await bcrypt.hash(updates.password, 12);
    }

    if (updates.roleId !== undefined) {
      const role = await this.prisma.role.findUnique({ where: { id: updates.roleId } });
      if (!role) throw new NotFoundException('Role não encontrada');
      data.roleId = updates.roleId;
    }

    return this.prisma.user.update({
      where: { id: targetId },
      data,
      select: { id: true, email: true, name: true, roleId: true },
    });
  }

  async deleteUser(requesterId: number, targetId: number) {
    await this.ensureAdmin(requesterId);

    const user = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    await this.prisma.refreshToken.deleteMany({ where: { userId: targetId } });
    await this.prisma.user.delete({ where: { id: targetId } });

    return { ok: true };
  }
}