import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateColumnDto {
  @ApiPropertyOptional({
    description: 'Название колонки',
    example: 'В работе',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  title: string;
}
