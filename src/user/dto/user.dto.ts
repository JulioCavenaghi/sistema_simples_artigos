import { IsEmail, IsOptional, IsString, MinLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'O e-mail informado não é válido.' })
  email: string;

  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  password: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'O e-mail informado não é válido.' })
  email: string;

  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  password: string;

  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string.' })
  name?: string;

  @Type(() => Number)
  @IsInt({ message: 'O ID da função deve ser um número inteiro.' })
  roleId: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'O e-mail informado não é válido.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string.' })
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ID da função deve ser um número inteiro.' })
  roleId?: number;
}