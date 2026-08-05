import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Alarm,
  AlarmStatus,
} from './entities/alarm.entity';

import {
  AlarmParticipant,
  AlarmParticipantStatus,
} from './entities/alarm-participant.entity';

import { UsersService } from '../users/users.service';

@Injectable()
export class AlarmsService {
  constructor(
    @InjectRepository(Alarm)
    private readonly alarmRepository: Repository<Alarm>,

    @InjectRepository(AlarmParticipant)
    private readonly participantRepository: Repository<AlarmParticipant>,

    private readonly usersService: UsersService,
  ) {}

  async create(createdByUserId: number) {
    // 1. Tworzymy alarm
    const alarm = this.alarmRepository.create({
      createdByUserId,
      status: AlarmStatus.RUNNING,
    });

    const savedAlarm = await this.alarmRepository.save(alarm);

    // 2. Pobieramy wszystkich aktywnych użytkowników
    const users = await this.usersService.findAllActive();

    // 3. Tworzymy uczestnika alarmu dla każdego użytkownika
    const participants = users.map((user) =>
      this.participantRepository.create({
        alarmId: savedAlarm.id,
        userId: user.id,
        status: AlarmParticipantStatus.PENDING,
      }),
    );

    // 4. Zapisujemy wszystkich uczestników
    await this.participantRepository.save(participants);

    // 5. Zwracamy alarm razem z liczbą osób do alarmowania
    return {
      ...savedAlarm,
      participantsCount: participants.length,
    };
  }

  async findAll(): Promise<Alarm[]> {
    return this.alarmRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }
}