import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.article.findMany({
      include: { author: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { author: { select: { id: true, email: true, name: true } } },
    });
    if (!article) throw new NotFoundException('Artigo não encontrado');
    return article;
  }

  async create(data: CreateArticleDto & { authorId?: number }) {
    return this.prisma.article.create({
      data: {
        title: data.title,
        body: data.body,
        authorId: data.authorId ?? null,
      },
    });
  }

  async update(id: number, updates: UpdateArticleDto, requester: any) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Artigo não encontrado');

    return this.prisma.article.update({
      where: { id },
      data: {
        ...(updates.title !== undefined ? { title: updates.title } : {}),
        ...(updates.body !== undefined ? { body: updates.body } : {}),
      },
    });

  }

  async remove(id: number, requester: any) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Artigo não encontrado');

    await this.prisma.article.delete({ where: { id } });
    return { ok: true };
  }
}