import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';

import { AsteriskService } from './asterisk.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Asterisk')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('asterisk')
export class AsteriskController {
  constructor(
    private readonly asteriskService: AsteriskService,
  ) {}

  @Get('ping')
  @Roles('ADMIN')
  ping() {
    return this.asteriskService.ping();
  }
}