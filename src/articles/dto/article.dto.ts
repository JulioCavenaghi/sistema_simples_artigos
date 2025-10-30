import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsString({ message: 'O título deve ser uma string.' })
  @MinLength(3, { message: 'O título deve ter pelo menos 3 caracteres.' })
  @MaxLength(200, { message: 'O título deve ter no máximo 200 caracteres.' })
  title: string;

  @IsString({ message: 'O corpo do artigo deve ser uma string.' })
  @MinLength(10, { message: 'O corpo do artigo deve ter pelo menos 10 caracteres.' })
  body: string;
}

export class UpdateArticleDto {
  @IsOptional()
  @IsString({ message: 'O título deve ser uma string.' })
  @MinLength(3, { message: 'O título deve ter pelo menos 3 caracteres.' })
  @MaxLength(200, { message: 'O título deve ter no máximo 200 caracteres.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'O corpo do artigo deve ser uma string.' })
  @MinLength(10, { message: 'O corpo do artigo deve ter pelo menos 10 caracteres.' })
  body?: string;
}