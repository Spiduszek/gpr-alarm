import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AlarmsService } from './alarms.service';
import { AlarmParticipantStatus } from './entities/alarm-participant.entity';

interface PhoneResponseBody {
  secret: string;
  status: string;
}

@Controller('asterisk')
export class AsteriskCallbackController {
  constructor(
    private readonly alarmsService: AlarmsService,
    private readonly configService: ConfigService,
  ) {}

  @Post(
    'alarms/:alarmId/participants/:userId/response',
  )
  async phoneResponse(
    @Param('alarmId') alarmId: string,
    @Param('userId') userId: string,
    @Body() body: PhoneResponseBody,
  ) {
    const expectedSecret =
      this.configService.get<string>(
        'ASTERISK_CALLBACK_SECRET',
      );

    if (
      !expectedSecret ||
      body.secret !== expectedSecret
    ) {
      throw new ForbiddenException(
        'Nieprawidłowy sekret Asterisk.',
      );
    }

    let status: AlarmParticipantStatus;

    if (body.status === 'GOING') {
      status = AlarmParticipantStatus.GOING;
    } else if (body.status === 'NOT_GOING') {
      status =
        AlarmParticipantStatus.NOT_GOING;
    } else if (body.status === 'NO_ANSWER') {
      status =
        AlarmParticipantStatus.NO_ANSWER;
    } else {
      throw new ForbiddenException(
        'Nieprawidłowy status odpowiedzi.',
      );
    }

    const participant =
      await this.alarmsService.updateParticipantStatus(
        Number(alarmId),
        Number(userId),
        status,
      );

    return {
      success: true,
      alarmId: participant.alarmId,
      userId: participant.userId,
      status: participant.status,
    };
  }
}
