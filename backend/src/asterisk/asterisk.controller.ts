import {
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';

import { AsteriskService } from './asterisk.service';
import { UsersService } from '../users/users.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Asterisk')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('asterisk')
export class AsteriskController {
  constructor(
    private readonly asteriskService: AsteriskService,
    private readonly usersService: UsersService,
  ) {}

  @Get('ping')
  @Roles('ADMIN')
  ping() {
    return this.asteriskService.ping();
  }

  @Post('test-call')
  @Roles('ADMIN')
  async testCall(
    @Request() req: any,
  ) {
    const user = await this.usersService.findOne(
      req.user.id,
    );

    if (!user) {
      throw new NotFoundException(
        'Nie znaleziono zalogowanego użytkownika.',
      );
    }

    if (!user.phone?.trim()) {
      throw new NotFoundException(
        'Administrator nie ma przypisanego numeru telefonu.',
      );
    }

    return this.asteriskService.originateTestCall(
      user.phone,
    );
  }
}