import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

type UserCreationData = {
  email: string;
  password_hash: string;
};

/**
 * Service for user management and queries.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(userData: UserCreationData): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOneBy({ email });
    return user === null ? undefined : user;
  }

  async findOne(id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOneBy({ id });
    return user === null ? undefined : user;
  }
}
