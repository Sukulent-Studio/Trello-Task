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
import { ColumnsService } from 'src/columns/columns.service';
import { CreateColumnDto } from 'src/columns/dto/column.create.dto';
import { UpdateColumnDto } from 'src/columns/dto/columnt.update.dto';
import { CurrentUser } from 'src/common/decorators/current.user.decorator';
import { UpdateUserDto } from './dto/update.user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly columnService: ColumnsService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Получить свой профиль' })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя',
    type: UserResponseDto,
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        first_name: 'John',
        second_name: 'Doe',
        created_at: '2026-04-05T12:00:00.000Z',
        updated_at: '2026-04-05T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не предоставлен или невалиден',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async getMe(@CurrentUser() user: IJwtPayload) {
    return await this.usersService.findByIdOrThrow(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить профиль другого пользователя по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID пользователя',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя',
    type: UserResponseDto,
    schema: {
      example: {
        id: 2,
        email: 'other@example.com',
        first_name: 'Jane',
        second_name: 'Smith',
        created_at: '2026-04-04T10:00:00.000Z',
        updated_at: '2026-04-04T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не предоставлен или невалиден',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 999 not found',
        error: 'Not Found',
      },
    },
  })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findByIdOrThrow(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить информацию профиля' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Поля для обновления',
    examples: {
      updateName: {
        summary: 'Обновить имя и фамилию',
        value: {
          first_name: 'John',
          second_name: 'Doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Профиль успешно обновлён',
    type: UserResponseDto,
    schema: {
      example: {
        id: 1,
        email: 'newemail@example.com',
        first_name: 'John',
        second_name: 'Doe',
        created_at: '2026-04-05T12:00:00.000Z',
        updated_at: '2026-04-05T14:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации данных',
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не предоставлен или невалиден',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  async updateMe(@CurrentUser() user: IJwtPayload, @Body() dto: UpdateUserDto) {
    return await this.usersService.update(user.sub, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Удалить свой профиль' })
  @ApiResponse({
    status: 200,
    description: 'Аккаунт успешно удалён',
    schema: {
      example: {
        message: 'Account deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Токен не предоставлен или невалиден',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async removeMe(@CurrentUser() user: IJwtPayload) {
    await this.usersService.remove(user.sub);
    return { message: 'Account deleted successfully' };
  }

  @Get('/columns')
  async getColumns(@CurrentUser() user: IJwtPayload) {
    return await this.columnService.getAllColumnsByUserIdOrThrow(user.sub);
  }

  @Get('/columns/:id')
  async getColumnById(
    @CurrentUser() user: IJwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.columnService.getUserColumnByIdOrThrow(user.sub, id);
  }

  @Post('/columns')
  async createColumn(
    @CurrentUser() user: IJwtPayload,
    @Body() dto: CreateColumnDto,
  ) {
    return await this.columnService.createColumn(dto, user.sub);
  }

  @Patch('/columns/:id')
  async changeColumn(
    @CurrentUser() user: IJwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateColumnDto,
  ) {
    return await this.columnService.changeColumn(dto, user.sub, id);
  }

  @Patch('columns/:columnId/:position')
  async changePosition(
    @CurrentUser() user: IJwtPayload,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('position', ParseIntPipe) position: number,
  ) {
    return await this.columnService.changePosition(
      user.sub,
      columnId,
      position,
    );
  }

  @Delete('/columns/:id')
  async deleteColumn(
    @CurrentUser() user: IJwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.columnService.deleteColumn(user.sub, id);
  }
}
