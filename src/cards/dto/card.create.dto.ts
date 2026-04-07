import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ example: 'Изучить FastAPI' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Подробное описание задачи', required: false })
  @IsOptional()
  @IsString()
  description: string | null;
}
