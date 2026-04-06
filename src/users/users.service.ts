import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbService } from 'src/db/db.service';
import {
  NewUser,
  PublicUser,
  User,
  users,
  usersPublicFields,
} from 'src/db/schema';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class UsersService {
  constructor(private connection: DbService) {}

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const newUser: NewUser = {
      email: dto.email,
      password: dto.password,
      first_name: dto.first_name,
      second_name: dto.second_name,
    };

    const result = await this.connection.db
      .insert(users)
      .values(newUser)
      .returning(usersPublicFields);
    return result[0];
  }

  async findByEmail(email: string): Promise<PublicUser | null> {
    const result = await this.connection.db
      .select(usersPublicFields)
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async findByEmailOrThrow(email: string): Promise<PublicUser> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findById(id: number): Promise<PublicUser | null> {
    const result = await this.connection.db
      .select(usersPublicFields)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findByIdOrThrow(id: number): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByIdPwd(id: number): Promise<User> {
    const result = await this.connection.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0];
  }

  async findByEmailPwd(email: string): Promise<User> {
    const result = await this.connection.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0];
  }

  async remove(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.connection.db.delete(users).where(eq(users.id, id));
  }

  async update(id: number, dto: UpdateUserDto): Promise<PublicUser> {
    await this.findByIdOrThrow(id);

    const updateData: Partial<NewUser> = {
      ...(dto.first_name ? { first_name: dto.first_name } : {}),
      ...(dto.second_name ? { second_name: dto.second_name } : {}),
    };

    const result = await this.connection.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning(usersPublicFields);

    return result[0];
  }
}
