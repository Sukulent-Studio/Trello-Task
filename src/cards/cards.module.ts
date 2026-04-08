import { Module } from '@nestjs/common';
import { CommentsModule } from 'src/comments/comments.module';
import { DbModule } from 'src/db/db.module';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [DbModule, CommentsModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
