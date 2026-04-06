import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DbService } from 'src/db/db.service';
import { Column, columns, NewColumn } from 'src/db/schema';
import { CreateColumnDto } from './dto/column.create.dto';
import { UpdateColumnDto } from './dto/columnt.update.dto';

@Injectable()
export class ColumnsService {
  constructor(private connection: DbService) {}

  private async getColumnByIdOrThrow(column_id: number): Promise<Column> {
    const result = await this.connection.db
      .select()
      .from(columns)
      .where(eq(columns.id, column_id))
      .limit(1);

    if (!result) {
      throw new NotFoundException('Column not found');
    }

    return result[0];
  }

  async getAllColumnsByUserIdOrThrow(user_id: number): Promise<Array<Column>> {
    const result = await this.connection.db
      .select()
      .from(columns)
      .where(eq(columns.user_id, user_id));

    if (!result) {
      throw new NotFoundException('User has no columns');
    }

    return result;
  }

  async getUserColumnByIdOrThrow(
    user_id: number,
    column_id: number,
  ): Promise<Column> {
    const result = await this.connection.db
      .select()
      .from(columns)
      .where(and(eq(columns.user_id, user_id), eq(columns.id, column_id)));

    if (!result) {
      throw new NotFoundException('User doesn`t have such column');
    }

    return result[0];
  }

  async createColumn(dto: CreateColumnDto, user_id: number): Promise<Column> {
    const newColumn: NewColumn = {
      title: dto.title,
      user_id: user_id,
      position: (await this.getColumnCount(user_id)) + 1,
    };

    const result = await this.connection.db
      .insert(columns)
      .values(newColumn)
      .returning();

    return result[0];
  }

  private async getColumnCount(user_id: number): Promise<number> {
    const result = await this.getAllColumnsByUserIdOrThrow(user_id);
    return !result ? 0 : result.length;
  }

  async changeColumn(
    dto: UpdateColumnDto,
    user_id: number,
    column_id: number,
  ): Promise<Column> {
    await this.getUserColumnByIdOrThrow(user_id, column_id);

    const updateData: Partial<NewColumn> = {
      ...(dto.title ? { title: dto.title } : {}),
    };

    const [result] = await this.connection.db
      .update(columns)
      .set(updateData)
      .where(and(eq(columns.user_id, user_id), eq(columns.id, column_id)))
      .returning();

    return result;
  }

  async changePosition(
    user_id: number,
    column_id: number,
    index: number,
  ): Promise<Array<Column>> {
    return await this.connection.db.transaction(async (tx) => {
      const [column] = await tx
        .select()
        .from(columns)
        .where(and(eq(columns.id, column_id), eq(columns.user_id, user_id)));
      if (!column) {
        throw new NotFoundException('Колонка не найдена или нет прав доступа');
      }

      const allColumns = await tx
        .select()
        .from(columns)
        .where(eq(columns.user_id, user_id))
        .orderBy(asc(columns.position));

      const currentIndex = allColumns.findIndex((c) => c.id === column_id);
      const [movedColumn] = allColumns.splice(currentIndex, 1);

      if (index < 0 || index > allColumns.length) {
        throw new BadRequestException('Некорректная позиция');
      }

      allColumns.splice(index, 0, movedColumn);

      for (let i = 0; i < allColumns.length; i++) {
        await tx
          .update(columns)
          .set({ position: i + 1 })
          .where(eq(columns.id, allColumns[i].id));
      }

      return await tx
        .select()
        .from(columns)
        .where(eq(columns.user_id, user_id))
        .orderBy(asc(columns.position));
    });
  }

  async deleteColumn(user_id: number, column_id: number): Promise<void> {
    await this.getUserColumnByIdOrThrow(user_id, column_id);
    await this.connection.db
      .delete(columns)
      .where(and(eq(columns.user_id, user_id), eq(columns.id, column_id)));
  }
}
