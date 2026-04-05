import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth.response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({
    type: RegisterDto,
    description: 'Данные для регистрации',
    examples: {
      default: {
        summary: 'Пример регистрации',
        value: {
          email: 'user@example.com',
          password: '123456',
          first_name: 'John',
          second_name: 'Doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Успешная регистрация',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email уже существует' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        summary: 'Пример входа',
        value: {
          email: 'user@example.com',
          password: '123456',
        },
      },
    },
  })
  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Неверные учётные данные' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
