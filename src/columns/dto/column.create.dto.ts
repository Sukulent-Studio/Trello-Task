import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({
    description: 'Название колонки',
    example: 'В работе',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  title: string;
}
