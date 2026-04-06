import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DbService } from 'src/db/db.service';
import { cards, columns, NewColumn } from 'src/db/schema';
import { CreateColumnDto } from './dto/column.create.dto';
import { ColumnResponseDto } from './dto/column.response.dto';
import { ColumnsListResponseDto } from './dto/columns.list.response.dto';
import { UpdateColumnDto } from './dto/columnt.update.dto';

@Injectable()
export class ColumnsService {
  constructor(private connection: DbService) {}

  async getAllColumnsByUserIdOrThrow(
    user_id: number,
  ): Promise<ColumnsListResponseDto> {
    const result = await this.connection.db.query.columns.findMany({
      where: eq(columns.user_id, user_id),
      with: {
        cards: {
          orderBy: [asc(cards.position)],
        },
      },
    });

    if (!result) {
      throw new NotFoundException('Колонка не найдена или нет прав доступа');
    }

    return { data: result, total: result.length };
  }

  async getUserColumnByIdOrThrow(
    user_id: number,
    column_id: number,
  ): Promise<ColumnResponseDto> {
    const column = await this.connection.db.query.columns.findFirst({
      where: and(eq(columns.id, column_id), eq(columns.user_id, user_id)),
      with: {
        cards: {
          orderBy: [asc(cards.position)],
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Колонка не найдена или нет прав доступа');
    }

    return column;
  }

  async createColumn(
    dto: CreateColumnDto,
    user_id: number,
  ): Promise<ColumnResponseDto> {
    const newColumn: NewColumn = {
      title: dto.title,
      user_id: user_id,
      position: await this.getColumnCount(user_id),
    };

    const result = await this.connection.db
      .insert(columns)
      .values(newColumn)
      .returning();

    return result[0];
  }

  private async getColumnCount(user_id: number): Promise<number> {
    const result = await this.getAllColumnsByUserIdOrThrow(user_id);
    return !result ? 0 : result.total;
  }

  async changeColumn(
    dto: UpdateColumnDto,
    user_id: number,
    column_id: number,
  ): Promise<ColumnResponseDto> {
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
  ): Promise<ColumnsListResponseDto> {
    await this.connection.db.transaction(async (tx) => {
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
          .set({ position: i })
          .where(eq(columns.id, allColumns[i].id));
      }
    });

    return await this.getAllColumnsByUserIdOrThrow(user_id);
  }

  async deleteColumn(user_id: number, column_id: number): Promise<void> {
    await this.getUserColumnByIdOrThrow(user_id, column_id);
    await this.connection.db
      .delete(columns)
      .where(and(eq(columns.user_id, user_id), eq(columns.id, column_id)));
  }
}
