import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
  constructor(private readonly cardsService: CardsService) {}

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
}
