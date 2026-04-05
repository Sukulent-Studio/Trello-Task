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
import { UpdateUserDto } from './dto/update.user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
