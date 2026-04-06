import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateColumnDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  title: string;
}
