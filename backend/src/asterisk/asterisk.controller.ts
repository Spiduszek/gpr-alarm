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

@ApiTags('Asterisk')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('asterisk')
export class AsteriskController {
  constructor(
    private readonly asteriskService: AsteriskService,
  ) {}

  @Get('ping')
  ping() {
    return this.asteriskService.ping();
  }
}
