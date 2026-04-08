import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Пароль (минимум 6 символов)',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'Имя пользователя',
    required: true,
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Фамилия пользователя',
    required: true,
  })
  @IsString()
  second_name: string;
}
