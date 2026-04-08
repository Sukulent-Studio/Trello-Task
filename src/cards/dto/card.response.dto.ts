import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CardResponseDto {
  @ApiProperty({ example: 1, description: 'ID карточки' })
  @IsInt()
  id: number;

  @ApiProperty({ example: 5, description: 'ID колонки' })
  @IsInt()
  column_id: number;

  @ApiProperty({ example: 'Сделать домашку' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Описание задачи...', required: false })
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiProperty({ example: 1 })
  @IsNumber()
  position: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updated_at: Date;
}
