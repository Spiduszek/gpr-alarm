import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Alarm,
  AlarmStatus,
} from './entities/alarm.entity';

@Injectable()
export class AlarmsService {
  constructor(
    @InjectRepository(Alarm)
    private readonly alarmRepository: Repository<Alarm>,
  ) {}

  async create(createdByUserId: number): Promise<Alarm> {
    const alarm = this.alarmRepository.create({
      createdByUserId,
      status: AlarmStatus.RUNNING,
    });

    return this.alarmRepository.save(alarm);
  }

  async findAll(): Promise<Alarm[]> {
    return this.alarmRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }
}