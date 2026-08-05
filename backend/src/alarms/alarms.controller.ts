import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AlarmsService } from './alarms.service';
import { CreateAlarmDto } from './dto/create-alarm.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Alarms')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('alarms')
export class AlarmsController {
  constructor(
    private readonly alarmsService: AlarmsService,
  ) {}

  @Post()
  create(@Body() createAlarmDto: CreateAlarmDto) {
    return this.alarmsService.create(createAlarmDto);
  }

  @Get()
  findAll() {
    return this.alarmsService.findAll();
  }
}