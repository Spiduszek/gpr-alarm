import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

import { SetActiveDto } from './dto/set-active.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @Patch(':id')
@Roles('ADMIN')
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateUserDto: UpdateUserDto,
  @Request() req: any,
) {

  if (
  id === req.user.id &&
  updateUserDto.role &&
  updateUserDto.role !== 'ADMIN'
) {
  throw new BadRequestException(
    'Nie możesz odebrać sobie roli administratora.',
  );
}
  const user = await this.usersService.update(
    id,
    updateUserDto,
  );

  if (!user) {
    throw new NotFoundException(
      `Użytkownik ${id} nie istnieje.`,
    );
  }

  return user;
}

@Patch(':id/active')
@Roles('ADMIN')
async setActive(
  @Param('id', ParseIntPipe) id: number,
  @Body('active') active: boolean,
  @Request() req: any,
) {
  if (id === req.user.id && active === false) {
    throw new BadRequestException(
      'Nie możesz dezaktywować własnego konta.',
    );
  }

  const user = await this.usersService.setActive(
    id,
    active,
  );

  if (!user) {
    throw new NotFoundException(
      `Użytkownik ${id} nie istnieje.`,
    );
  }

  return user;
}

@Delete(':id')
@Roles('ADMIN')
async remove(
  @Param('id', ParseIntPipe) id: number,
  @Request() req: any,
) {
  if (id === req.user.id) {
    throw new BadRequestException(
      'Nie możesz usunąć własnego konta.',
    );
  }

  const removed = await this.usersService.remove(id);

  if (!removed) {
    throw new NotFoundException(
      `Użytkownik ${id} nie istnieje.`,
    );
  }

  return {
    message: `Użytkownik ${id} został usunięty.`,
  };
}
}