import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { CardResponseDto } from './card.response.dto';

export class CardsListResponseDto {
  @ApiProperty({
    type: [CardResponseDto],
    description: 'Список карточек колонки',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardResponseDto)
  data: CardResponseDto[];

  @ApiProperty({ example: 3, description: 'Общее количество карточек' })
  @IsNumber()
  total: number;
}
