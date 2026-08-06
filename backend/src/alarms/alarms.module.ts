import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Alarm } from './entities/alarm.entity';
import { AlarmParticipant } from './entities/alarm-participant.entity';

import { AlarmsController } from './alarms.controller';
import { AsteriskCallbackController } from './asterisk-callback.controller';
import { AlarmsService } from './alarms.service';

import { UsersModule } from '../users/users.module';
import { AsteriskModule } from '../asterisk/asterisk.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Alarm,
      AlarmParticipant,
    ]),
    UsersModule,
    AsteriskModule,
  ],

  controllers: [
  AlarmsController,
  AsteriskCallbackController,
],

  providers: [
    AlarmsService,
  ],

  exports: [
    AlarmsService,
  ],
})
export class AlarmsModule {}