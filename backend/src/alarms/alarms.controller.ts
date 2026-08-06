import {
  Body,
  Controller,
  ForbiddenException,
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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Alarms')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('alarms')
export class AlarmsController {
  constructor(
    private readonly alarmsService: AlarmsService,
  ) {}

  @Post()
  @Roles('ADMIN')
create(@Request() req: any) {
    return this.alarmsService.create(
      req.user.id,
    );
  }

  @Patch(':alarmId/finish')
  @Roles('ADMIN')
finish(
  @Param('alarmId') alarmId: string,
) {
  return this.alarmsService.finish(
    Number(alarmId),
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
  @Request() req: any,
) {
  const requestedUserId = Number(userId);

  // RATOWNIK może zmieniać wyłącznie swój status.
  // ADMIN może zmieniać status dowolnego uczestnika.
  if (
    req.user.role !== 'ADMIN' &&
    req.user.id !== requestedUserId
  ) {
    throw new ForbiddenException(
      'Nie możesz zmieniać odpowiedzi innego użytkownika.',
    );
  }

  return this.alarmsService.updateParticipantStatus(
    Number(alarmId),
    requestedUserId,
    dto.status,
  );
}
}