import { Controller, Get, Post, Put, Delete, Body, UseGuards,Request, Param, ParseIntPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { RoleId } from '../user/roles.enum';
import type { Request as ExpressRequest } from 'express';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleId.READER, RoleId.EDITOR, RoleId.ADMIN)
  @Get()
  findAll() {
    return this.articlesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleId.READER, RoleId.EDITOR, RoleId.ADMIN)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleId.ADMIN, RoleId.EDITOR)
  @Post()
  create(@Body() body: CreateArticleDto, @Request() req: ExpressRequest) {
    const authorId = (req as any).user?.id;
    return this.articlesService.create({ ...body, authorId });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleId.ADMIN, RoleId.EDITOR)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateArticleDto,
    @Request() req: ExpressRequest,
  ) {
    const requester = (req as any).user;
    return this.articlesService.update(id, body, requester);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleId.ADMIN, RoleId.EDITOR)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: ExpressRequest) {
    const requester = (req as any).user;
    return this.articlesService.remove(id, requester);
  }
}