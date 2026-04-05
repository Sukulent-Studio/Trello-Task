import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PublicUser } from 'src/db/schema';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { IJwtPayload } from './interfaces/jwt.payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPwd = await bcrypt.hash(
      dto.password,
      this.configService.getOrThrow('BCRYPT_SALT_ROUNDS'),
    );

    const user = await this.usersService.create({
      ...dto,
      password: hashedPwd,
    });

    const access_token = this.generateToken(user);
    return { access_token, token_type: 'bearer' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailPwd(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = this.generateToken(user);
    return { access_token, token_type: 'bearer' };
  }

  private generateToken(user: PublicUser) {
    const payload: IJwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow<number>('JWT_EXPIRES_IN'),
    });
  }
}
