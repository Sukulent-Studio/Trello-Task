import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { CommentResponseDto } from './comment.response.dto';

export class CommentsListResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentResponseDto)
  data: CommentResponseDto[];

  @ApiProperty({ example: 10 })
  @IsInt()
  total: number;
}
