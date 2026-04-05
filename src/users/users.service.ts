import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbService } from 'src/db/db.service';
import { NewUser, User, users } from 'src/db/schema';
import { CreateUserDto } from './dto/create.user.dto';

@Injectable()
export class UsersService {
  constructor(private connection: DbService) {}

  async create(dto: CreateUserDto): Promise<User> {
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
      .returning();
    return result[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.connection.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.connection.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findByIdOrThrow(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async remove(id: number): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.connection.db.delete(users).where(eq(users.id, id));
  }
}
