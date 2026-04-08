import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Уникальный идентификатор пользователя',
  })
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email адрес пользователя',
  })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'Имя пользователя',
  })
  first_name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Фамилия пользователя',
  })
  second_name: string;

  @ApiProperty({
    example: '2026-04-05T12:00:00.000Z',
    description: 'Дата создания аккаунта',
  })
  created_at: Date;

  @ApiProperty({
    example: '2026-04-05T14:30:00.000Z',
    description: 'Дата последнего обновления профиля',
  })
  updated_at: Date;
}
