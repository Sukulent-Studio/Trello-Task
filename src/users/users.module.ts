import { Module } from '@nestjs/common';
import { ColumnsModule } from 'src/columns/columns.module';
import { DbModule } from 'src/db/db.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DbModule, ColumnsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
