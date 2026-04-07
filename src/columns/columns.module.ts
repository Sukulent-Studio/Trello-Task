import { Module } from '@nestjs/common';
import { CardsModule } from 'src/cards/cards.module';
import { DbModule } from 'src/db/db.module';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';

@Module({
  imports: [DbModule, CardsModule],
  controllers: [ColumnsController],
  providers: [ColumnsService],
  exports: [ColumnsService],
})
export class ColumnsModule {}
