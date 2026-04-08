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
import { CardsService } from 'src/cards/cards.service';
import { CreateCardDto } from 'src/cards/dto/card.create.dto';
import { CardResponseDto } from 'src/cards/dto/card.response.dto';
import { CardsListResponseDto } from 'src/cards/dto/cards.list.response.dto';
import { CurrentUser } from 'src/common/decorators/current.user.decorator';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/column.create.dto';
import { ColumnResponseDto } from './dto/column.response.dto';
import { ColumnsListResponseDto } from './dto/columns.list.response.dto';
import { UpdateColumnDto } from './dto/columnt.update.dto';

@ApiTags('Columns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('columns')
export class ColumnsController {
  constructor(
    private readonly cardsService: CardsService,
    private readonly columnsService: ColumnsService,
  ) {}

  @Get('all')
  @ApiOperation({ summary: 'Получить все колонки текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список колонок пользователя',
    type: ColumnsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не предоставлен или невалиден',
  })
  async getColumns(@CurrentUser() user: IJwtPayload) {
    return await this.columnsService.getAllColumnsByUserIdOrThrow(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить колонку по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID колонки',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Данные колонки',
    type: ColumnResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не предоставлен или невалиден',
  })
  @ApiResponse({
    status: 404,
    description: 'Колонка не найдена',
  })
  async getColumnById(
    @CurrentUser() user: IJwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.columnsService.getUserColumnByIdOrThrow(user.sub, id);
  }

  @Post('/create')
  @ApiOperation({ summary: 'Создать новую колонку' })
  @ApiBody({
    type: CreateColumnDto,
    description: 'Данные для создания колонки',
    examples: {
      create: {
        summary: 'Создать колонку',
        value: {
          title: 'В работе',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Колонка успешно создана',
    type: ColumnResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации данных',
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не предоставлен или невалиден',
  })
  async createColumn(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: CreateColumnDto,
  ) {
    return await this.columnsService.createColumn(dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить колонку' })
  @ApiParam({
    name: 'id',
    description: 'ID колонки',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: UpdateColumnDto,
    description: 'Поля для обновления колонки',
    examples: {
      updateTitle: {
        summary: 'Обновить название колонки',
        value: {
          title: 'Готово',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Колонка успешно обновлена',
    type: ColumnResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации данных',
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не предоставлен или невалиден',
  })
  @ApiResponse({
    status: 404,
    description: 'Колонка не найдена',
  })
  async changeColumn(
    @CurrentUser() user: IJwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateColumnDto,
  ) {
    return await this.columnsService.changeColumn(dto, user.sub, id);
  }

  @Patch(':columnId/:position')
  @ApiOperation({ summary: 'Изменить позицию колонки' })
  @ApiParam({
    name: 'columnId',
    description: 'ID колонки',
    example: 1,
    type: Number,
  })
  @ApiParam({
    name: 'position',
    description: 'Новая позиция',
    example: 2,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Позиция успешно изменена',
    type: ColumnsListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не предоставлен или невалиден',
  })
  @ApiResponse({
    status: 404,
    description: 'Колонка не найдена',
  })
  async changePosition(
    @CurrentUser() user: IJwtPayload,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('position', ParseIntPipe) position: number,
  ) {
    return await this.columnsService.changePosition(
      user.sub,
      columnId,
      position,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить колонку' })
  @ApiParam({
    name: 'id',
    description: 'ID колонки',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Колонка успешно удалена',
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не предоставлен или невалиден',
  })
  @ApiResponse({
    status: 404,
    description: 'Колонка не найдена',
  })
  async deleteColumn(
    @CurrentUser() user: IJwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.columnsService.deleteColumn(user.sub, id);
  }

  @Post(':columnId/card')
  @ApiOperation({ summary: 'Создать карточку в колонке' })
  @ApiParam({ name: 'columnId', type: Number })
  @ApiResponse({ status: 201, type: CardResponseDto })
  async create(
    @CurrentUser() user: IJwtPayload,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Body() dto: CreateCardDto,
  ) {
    return await this.cardsService.create(user.sub, columnId, dto);
  }

  @Get(':columnId/cards/all')
  @ApiOperation({ summary: 'Получить все карточки колонки' })
  @ApiParam({ name: 'columnId', type: Number })
  @ApiResponse({ status: 200, type: CardsListResponseDto })
  async findAll(
    @CurrentUser() user: IJwtPayload,
    @Param('columnId', ParseIntPipe) columnId: number,
  ) {
    return await this.cardsService.getAllByColumnId(user.sub, columnId);
  }
}
