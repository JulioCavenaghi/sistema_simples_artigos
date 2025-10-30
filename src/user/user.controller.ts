import { Controller, Get, Post, Put, Delete, Body, UseGuards, Param, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { RoleId } from './roles.enum';
import type { Request as ExpressRequest } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleId.ADMIN)
  @Post()
  async register(@Req() req: ExpressRequest, @Body() body: RegisterDto) {
    const requesterId = (req as any).user?.id;
    return this.userService.register(requesterId, body.email, body.password, body.name, body.roleId);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleId.ADMIN)
  @Get()
  async list(@Req() req: ExpressRequest) {
    const requesterId = (req as any).user?.id;
    return this.userService.getAllUsers(requesterId);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleId.ADMIN)
  @Get(':id')
  async getOne(@Req() req: ExpressRequest, @Param('id') id: string) {
    const requesterId = (req as any).user?.id;
    return this.userService.findById(requesterId, Number(id));
  }

  @UseGuards(RolesGuard)
  @Roles(RoleId.ADMIN)
  @Put(':id')
  async update(@Req() req: ExpressRequest, @Param('id') id: string, @Body() body: UpdateUserDto) {
    const requesterId = (req as any).user?.id;
    return this.userService.updateUser(requesterId, Number(id), body);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleId.ADMIN)
  @Delete(':id')
  async remove(@Req() req: ExpressRequest, @Param('id') id: string) {
    const requesterId = (req as any).user?.id;
    return this.userService.deleteUser(requesterId, Number(id));
  }
}