import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Alarm } from './entities/alarm.entity';

import { AlarmsController } from './alarms.controller';
import { AlarmsService } from './alarms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alarm]),
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