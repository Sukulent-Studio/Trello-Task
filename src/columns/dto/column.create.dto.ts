import { IsString, MaxLength } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @MaxLength(100)
  title: string;
}
