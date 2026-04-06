import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ColumnResponseDto } from './column.response.dto';

export class ColumnsListResponseDto {
  @ApiProperty({
    type: [ColumnResponseDto],
    description: 'Список колонок пользователя',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColumnResponseDto)
  data: ColumnResponseDto[];

  @ApiProperty({ example: 3, description: 'Общее количество колонок' })
  @IsNumber()
  total: number;
}
