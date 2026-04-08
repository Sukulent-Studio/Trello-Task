import { PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './comment.create.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
