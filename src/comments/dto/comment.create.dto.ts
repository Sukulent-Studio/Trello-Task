import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Отличная задача, беру в работу!',
    description: 'Текст комментария',
  })
  @IsString()
  content: string;
}
