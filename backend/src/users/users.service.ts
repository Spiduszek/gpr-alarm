import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();

    user.login = createUserDto.login;
    user.password = await bcrypt.hash(createUserDto.password, 10);
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.phone = createUserDto.phone;

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findAllActive(): Promise<User[]> {
  return this.usersRepository.find({
    where: {
      active: true,
    },
  });
}

  async findByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        login,
      },
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }
  async update(
  id: number,
  updateUserDto: {
    login?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    password?: string;
    role?: 'RATOWNIK' | 'ADMIN';
  },
): Promise<User | null> {
  const user = await this.findOne(id);

  if (!user) {
    return null;
  }

  if (updateUserDto.login !== undefined) {
    user.login = updateUserDto.login;
  }

  if (updateUserDto.firstName !== undefined) {
    user.firstName = updateUserDto.firstName;
  }

  if (updateUserDto.lastName !== undefined) {
    user.lastName = updateUserDto.lastName;
  }

  if (updateUserDto.phone !== undefined) {
    user.phone = updateUserDto.phone;
  }

  if (updateUserDto.password) {
    user.password = await bcrypt.hash(
      updateUserDto.password,
      10,
    );
  }

  if (updateUserDto.role !== undefined) {
  user.role = updateUserDto.role;
}

  return this.usersRepository.save(user);
}

async setActive(
  id: number,
  active: boolean,
): Promise<User | null> {
  const user = await this.findOne(id);

  if (!user) {
    return null;
  }

  user.active = active;

  return this.usersRepository.save(user);
}

async remove(id: number): Promise<boolean> {
  const user = await this.findOne(id);

  if (!user) {
    return false;
  }

  await this.usersRepository.remove(user);

  return true;
}
}