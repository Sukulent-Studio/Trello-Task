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
import { CommentsService } from './comments.service';
import { CommentResponseDto } from './dto/comment.response.dto';
import { UpdateCommentDto } from './dto/comment.update.dto';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Получить комментарий по ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: IJwtPayload,
  ) {
    return this.commentsService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить комментарий' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  @ApiResponse({ status: 403, description: 'Нет прав на редактирование' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: IJwtPayload,
  ) {
    return this.commentsService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить комментарий' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Комментарий удалён' })
  @ApiResponse({ status: 403, description: 'Нет прав на удаление' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: IJwtPayload,
  ) {
    return this.commentsService.remove(user.sub, id);
  }
}
