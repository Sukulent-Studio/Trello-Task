import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DbService } from 'src/db/db.service';
import { cards, columns, NewCard } from 'src/db/schema';
import { CreateCardDto } from './dto/card.create.dto';
import { CardResponseDto } from './dto/card.response.dto';
import { UpdateCardDto } from './dto/card.update.dto';
import { CardsListResponseDto } from './dto/cards.list.response.dto';

@Injectable()
export class CardsService {
  constructor(private readonly connection: DbService) {}

  private async getUserColumnByIdOrThrow(
    user_id: number,
    column_id: number,
  ): Promise<void> {
    const [result] = await this.connection.db
      .select()
      .from(columns)
      .where(and(eq(columns.user_id, user_id), eq(columns.id, column_id)));

    if (!result) {
      throw new NotFoundException('Колонка не найдена');
    }
  }

  private async getCardsCount(column_id: number): Promise<number> {
    const result = await this.connection.db
      .select()
      .from(cards)
      .where(eq(cards.column_id, column_id));
    return !result ? 0 : result.length;
  }

  async create(
    user_id: number,
    column_id: number,
    dto: CreateCardDto,
  ): Promise<CardResponseDto> {
    await this.getUserColumnByIdOrThrow(user_id, column_id);

    const newCard: NewCard = {
      title: dto.title,
      ...(dto.description ? { description: dto.description } : {}),
      column_id: column_id,
      position: await this.getCardsCount(column_id),
    };

    const result = await this.connection.db
      .insert(cards)
      .values(newCard)
      .returning();

    return result[0];
  }

  async getAllByColumnId(
    user_id: number,
    column_id: number,
  ): Promise<CardsListResponseDto> {
    await this.getUserColumnByIdOrThrow(user_id, column_id);

    const result = await this.connection.db
      .select()
      .from(cards)
      .where(eq(cards.column_id, column_id))
      .orderBy(asc(cards.position));
    return { data: result, total: result.length };
  }

  async getOneById(user_id: number, card_id: number): Promise<CardResponseDto> {
    const result = await this.connection.db
      .select({ card: cards, col: columns })
      .from(cards)
      .leftJoin(columns, eq(cards.column_id, columns.id))
      .where(and(eq(cards.id, card_id), eq(columns.user_id, user_id)));

    if (!result.length)
      throw new NotFoundException('Карточка не найдена или нет прав доступа');
    return result[0].card;
  }

  async update(
    user_id: number,
    card_id: number,
    dto: UpdateCardDto,
  ): Promise<CardResponseDto> {
    await this.getOneById(card_id, user_id);

    const updateData: Partial<NewCard> = {
      ...(dto.title ? { title: dto.title } : {}),
      ...(dto.description ? { description: dto.description } : {}),
    };

    const [updated] = await this.connection.db
      .update(cards)
      .set(updateData)
      .where(eq(cards.id, card_id))
      .returning();
    return updated;
  }

  async updatePosition(
    user_id: number,
    card_id: number,
    targetIndex: number,
  ): Promise<CardsListResponseDto> {
    return await this.connection.db.transaction(async (tx) => {
      const [card] = await tx
        .select({ card: cards, col: columns })
        .from(cards)
        .leftJoin(columns, eq(cards.column_id, columns.id))
        .where(and(eq(cards.id, card_id), eq(columns.user_id, user_id)));

      if (!card)
        throw new NotFoundException('Карточка не найдена или нет прав');

      const column_id = card.col!.id;

      const allCards = await tx
        .select()
        .from(cards)
        .where(eq(cards.column_id, column_id))
        .orderBy(asc(cards.position));

      const currentIndex = allCards.findIndex((c) => c.id === card_id);
      if (currentIndex === -1)
        throw new BadRequestException('Ошибка целостности данных');
      const [movedCard] = allCards.splice(currentIndex, 1);

      if (targetIndex < 0 || targetIndex > allCards.length) {
        throw new BadRequestException('Некорректная позиция');
      }

      allCards.splice(targetIndex, 0, movedCard);

      for (let i = 0; i < allCards.length; i++) {
        await tx
          .update(cards)
          .set({ position: i })
          .where(eq(cards.id, allCards[i].id));
      }

      const result = await tx
        .select()
        .from(cards)
        .where(eq(cards.column_id, column_id));

      return { data: result, total: result.length };
    });
  }

  async remove(user_id: number, card_id: number): Promise<void> {
    await this.getOneById(card_id, user_id);
    await this.connection.db.delete(cards).where(eq(cards.id, card_id));
  }
}
