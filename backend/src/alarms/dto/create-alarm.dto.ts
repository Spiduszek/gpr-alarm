import { AlarmPriority } from '../entities/alarm.entity';

export class CreateAlarmDto {
  title!: string;
description!: string;
location!: string;
priority!: AlarmPriority;
}