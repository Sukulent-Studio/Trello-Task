import { PartialType } from '@nestjs/swagger';
import { CreateCardDto } from './card.create.dto';

export class UpdateCardDto extends PartialType(CreateCardDto) {}
