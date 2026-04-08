import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DbService } from 'src/db/db.service';
import { cards, columns, comments, NewComment, users } from 'src/db/schema';
import { CreateCommentDto } from './dto/comment.create.dto';
import { CommentResponseDto } from './dto/comment.response.dto';
import { UpdateCommentDto } from './dto/comment.update.dto';
import { CommentsListResponseDto } from './dto/comments.list.response.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly connection: DbService) {}

  private async assertCardAccess(
    user_id: number,
    card_id: number,
  ): Promise<void> {
    const [result] = await this.connection.db
      .select()
      .from(cards)
      .innerJoin(columns, eq(cards.column_id, columns.id))
      .where(and(eq(cards.id, card_id), eq(columns.user_id, user_id)));

    if (!result) {
      throw new NotFoundException('Карточка не найдена или нет прав доступа');
    }
  }

  private async isAuthor(user_id: number, comment_id: number): Promise<void> {
    const [existing] = await this.connection.db
      .select({ comment: comments, card: cards, column: columns })
      .from(comments)
      .innerJoin(cards, eq(comments.card_id, cards.id))
      .innerJoin(columns, eq(cards.column_id, columns.id))
      .where(and(eq(comments.id, comment_id), eq(comments.author_id, user_id)));

    if (!existing) {
      throw new NotFoundException('Комментарий не найден или вы не автор');
    }
  }

  async create(
    user_id: number,
    card_id: number,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    await this.assertCardAccess(user_id, card_id);

    const newComment: NewComment = {
      content: dto.content,
      card_id: card_id,
      author_id: user_id,
    };

    const [comment] = await this.connection.db
      .insert(comments)
      .values(newComment)
      .returning();

    return { ...comment, author: null };
  }

  async findAllByCardId(
    user_id: number,
    card_id: number,
  ): Promise<CommentsListResponseDto> {
    await this.assertCardAccess(user_id, card_id);

    const result = await this.connection.db
      .select({
        id: comments.id,
        content: comments.content,
        card_id: comments.card_id,
        author_id: comments.author_id,
        created_at: comments.created_at,
        author: {
          id: users.id,
          email: users.email,
          first_name: users.first_name,
          second_name: users.second_name,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.author_id, users.id))
      .where(eq(comments.card_id, card_id))
      .orderBy(asc(comments.created_at));

    return { data: result, total: result.length };
  }

  async findOne(
    user_id: number,
    comment_id: number,
  ): Promise<CommentResponseDto> {
    const [result] = await this.connection.db
      .select({
        comment: comments,
        author: {
          id: users.id,
          email: users.email,
          first_name: users.first_name,
          second_name: users.second_name,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.author_id, users.id))
      .innerJoin(cards, eq(comments.card_id, cards.id))
      .innerJoin(columns, eq(cards.column_id, columns.id))
      .where(and(eq(comments.id, comment_id), eq(columns.user_id, user_id)));

    if (!result) {
      throw new NotFoundException('Комментарий не найден или нет прав доступа');
    }

    return { ...result.comment, author: result.author };
  }

  async update(
    user_id: number,
    comment_id: number,
    dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    await this.isAuthor(user_id, comment_id);

    const [updated] = await this.connection.db
      .update(comments)
      .set({ content: dto.content })
      .where(eq(comments.id, comment_id))
      .returning();

    return { ...updated, author: null };
  }

  async remove(user_id: number, comment_id: number): Promise<void> {
    await this.isAuthor(user_id, comment_id);

    await this.connection.db
      .delete(comments)
      .where(eq(comments.id, comment_id));
  }
}
