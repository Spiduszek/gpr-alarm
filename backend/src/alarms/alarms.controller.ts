import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { AlarmsService } from './alarms.service';
import { UpdateParticipantStatusDto } from './dto/update-participant-status.dto';
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
@Get(':alarmId/summary')
getSummary(
  @Param('alarmId') alarmId: string,
) {
  return this.alarmsService.getSummary(
    Number(alarmId),
  );
}
  @Get(':alarmId/participants')
findParticipants(
  @Param('alarmId') alarmId: string,
) {
  return this.alarmsService.findParticipants(
    Number(alarmId),
  );
}
  @Patch(':alarmId/participants/:userId/status')
updateParticipantStatus(
  @Param('alarmId') alarmId: string,
  @Param('userId') userId: string,
  @Body() dto: UpdateParticipantStatusDto,
) {
  return this.alarmsService.updateParticipantStatus(
    Number(alarmId),
    Number(userId),
    dto.status,
  );
}
}