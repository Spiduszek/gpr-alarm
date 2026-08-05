import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { AlarmsService } from './alarms.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Alarms')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('alarms')
export class AlarmsController {
  constructor(
    private readonly alarmsService: AlarmsService,
  ) {}

  @Post()
  create(@Request() req: any) {
    return this.alarmsService.create(
      req.user.id,
    );
  }

  @Get()
  findAll() {
    return this.alarmsService.findAll();
  }
}