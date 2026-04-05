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
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import type { IJwtPayload } from 'src/auth/interfaces/jwt.payload.interface';
import { CurrentUser } from 'src/common/decorators/current.user.decorator';
import { UpdateUserDto } from './dto/update.user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Получить свой профиль' })
  @ApiResponse({ status: 200, description: 'Данные пользователя' })
  @Get('me')
  async getMe(@CurrentUser() user: IJwtPayload) {
    await this.usersService.findByIdOrThrow(user.sub);
  }

  @ApiOperation({ summary: 'Получить профиль другого пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Данные пользователя' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findByIdOrThrow(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить информацию профиля' })
  @ApiResponse({ status: 200, description: 'Профиль обновлён' })
  @ApiResponse({ status: 409, description: 'Email уже занят' })
  async updateMe(@CurrentUser() user: IJwtPayload, @Body() dto: UpdateUserDto) {
    return await this.usersService.update(user.sub, dto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Удалить свой аккаунт' })
  @ApiResponse({ status: 200, description: 'Аккаунт удалён' })
  async removeMe(@CurrentUser() user: IJwtPayload) {
    await this.usersService.remove(user.sub);
    return { message: 'Account deleted successfully' };
  }
}
