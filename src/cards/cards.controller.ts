import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import type { IJwtPayload } from 'src/auth/interfaces/jwt.payload.interface';
import { CommentsService } from 'src/comments/comments.service';
import { CreateCommentDto } from 'src/comments/dto/comment.create.dto';
import { CommentResponseDto } from 'src/comments/dto/comment.response.dto';
import { CurrentUser } from 'src/common/decorators/current.user.decorator';
import { CardsService } from './cards.service';
import { CardResponseDto } from './dto/card.response.dto';
import { UpdateCardDto } from './dto/card.update.dto';
import { CardsListResponseDto } from './dto/cards.list.response.dto';

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Получить карточку по ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CardResponseDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: IJwtPayload,
  ) {
    return await this.cardsService.getOneById(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить карточку' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CardResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCardDto,
    @CurrentUser() user: IJwtPayload,
  ) {
    return await this.cardsService.update(user.sub, id, dto);
  }

  @Patch(':id/:position')
  @ApiOperation({ summary: 'Изменить позицию карточки' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      properties: {
        id: { type: 'number', example: 1 },
        position: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Позиция успешно обновлена',
    type: CardsListResponseDto,
  })
  async updatePosition(
    @Param('id', ParseIntPipe) id: number,
    @Param('position', ParseIntPipe) position: number,
    @CurrentUser() user: IJwtPayload,
  ) {
    return await this.cardsService.updatePosition(user.sub, id, position);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить карточку' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Карточка удалена' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: IJwtPayload,
  ) {
    return this.cardsService.remove(user.sub, id);
  }

  @Post(':cardId/comments')
  @ApiOperation({ summary: 'Добавить комментарий к карточке' })
  @ApiParam({ name: 'cardId', type: Number, description: 'ID карточки' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  @ApiResponse({ status: 404, description: 'Карточка не найдена' })
  async create(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: IJwtPayload,
  ) {
    return this.commentsService.create(user.sub, cardId, dto);
  }

  @Get(':cardId/comments/all')
  @ApiOperation({ summary: 'Получить все комментарии карточки' })
  @ApiParam({ name: 'cardId', type: Number })
  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  @ApiResponse({ status: 404, description: 'Карточка не найдена' })
  async findAll(
    @Param('cardId', ParseIntPipe) cardId: number,
    @CurrentUser() user: IJwtPayload,
  ) {
    return this.commentsService.findAllByCardId(user.sub, cardId);
  }
}
