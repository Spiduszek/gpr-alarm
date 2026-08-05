import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Alarm } from './entities/alarm.entity';
import { CreateAlarmDto } from './dto/create-alarm.dto';

@Injectable()
export class AlarmsService {
  constructor(
    @InjectRepository(Alarm)
    private readonly alarmRepository: Repository<Alarm>,
  ) {}

  async create(createAlarmDto: CreateAlarmDto) {
    const alarm = this.alarmRepository.create(createAlarmDto);
    return this.alarmRepository.save(alarm);
  }

  async findAll() {
    return this.alarmRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }
}