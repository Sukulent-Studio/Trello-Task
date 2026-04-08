import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CommentAuthorDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  second_name: string;
}

export class CommentResponseDto {
  @ApiProperty({ example: 42 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Отличный план!' })
  @IsString()
  content: string;

  @ApiProperty({ example: 15, description: 'ID карточки' })
  @IsInt()
  card_id: number;

  @ApiProperty({ example: 3, description: 'ID автора комментария' })
  @IsInt()
  author_id: number;

  @ApiProperty({
    type: CommentAuthorDto,
    description: 'Информация об авторе',
    required: false,
  })
  author: CommentAuthorDto | null;

  @ApiProperty({ example: '2024-01-15T14:30:00.000Z' })
  created_at: Date;
}
