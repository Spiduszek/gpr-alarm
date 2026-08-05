import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Alarm } from './entities/alarm.entity';
import { AlarmParticipant } from './entities/alarm-participant.entity';

import { AlarmsController } from './alarms.controller';
import { AlarmsService } from './alarms.service';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Alarm,
      AlarmParticipant,
    ]),
    UsersModule,
  ],

  controllers: [
    AlarmsController,
  ],

  providers: [
    AlarmsService,
  ],

  exports: [
    AlarmsService,
  ],
})
export class AlarmsModule {}