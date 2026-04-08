import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CardResponseDto } from 'src/cards/dto/card.response.dto';

export class ColumnResponseDto {
  @ApiProperty({ example: 5, description: 'ID колонки' })
  @IsInt()
  id: number;

  @ApiProperty({ example: 1, description: 'ID пользователя' })
  @IsInt()
  user_id: number;

  @ApiProperty({ example: 'To Do' })
  @IsString()
  title: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  position: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  created_at: Date;

  @ApiProperty({ type: [CardResponseDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardResponseDto)
  cards?: CardResponseDto[];
}
