import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const runningAlarm = await this.alarmRepository.findOne({
  where: {
    status: AlarmStatus.RUNNING,
  },
});

if (runningAlarm) {
  throw new ConflictException(
    `Alarm ${runningAlarm.id} jest już aktywny.`,
  );
}
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
  async updateParticipantStatus(
  alarmId: number,
  userId: number,
  status: AlarmParticipantStatus,
): Promise<AlarmParticipant> {

  const alarm = await this.alarmRepository.findOne({
  where: {
    id: alarmId,
  },
});

if (!alarm) {
  throw new NotFoundException(
    `Alarm ${alarmId} nie istnieje.`,
  );
}

if (alarm.status === AlarmStatus.FINISHED) {
  throw new ConflictException(
    `Alarm ${alarmId} jest zakończony. Nie można zmieniać odpowiedzi uczestników.`,
  );
}

  const participant =
    await this.participantRepository.findOne({
      where: {
        alarmId,
        userId,
      },
    });

  if (!participant) {
  throw new NotFoundException(
    `Użytkownik ${userId} nie jest uczestnikiem alarmu ${alarmId}.`,
  );
}

  participant.status = status;

  if (
    status === AlarmParticipantStatus.GOING ||
    status === AlarmParticipantStatus.NOT_GOING
  ) {
    participant.answeredAt = new Date();
  } else {
    participant.answeredAt = null;
  }

  return this.participantRepository.save(participant);
}
async findParticipants(alarmId: number) {
  const participants =
    await this.participantRepository.find({
      where: {
        alarmId,
      },
      order: {
        id: 'ASC',
      },
    });

  return Promise.all(
    participants.map(async (participant) => {
      const user = await this.usersService.findOne(
        participant.userId,
      );

      return {
        id: participant.id,
        alarmId: participant.alarmId,
        userId: participant.userId,

        firstName: user?.firstName ?? null,
        lastName: user?.lastName ?? null,
        phone: user?.phone ?? null,

        status: participant.status,
        answeredAt: participant.answeredAt,
        createdAt: participant.createdAt,
        updatedAt: participant.updatedAt,
      };
    }),
  );
}
async getSummary(alarmId: number) {
  const participants =
    await this.participantRepository.find({
      where: { alarmId },
    });

  const summary = {
    total: participants.length,
    pending: 0,
    going: 0,
    notGoing: 0,
    noAnswer: 0,
  };

  for (const participant of participants) {
    switch (participant.status) {
      case AlarmParticipantStatus.PENDING:
        summary.pending++;
        break;

      case AlarmParticipantStatus.GOING:
        summary.going++;
        break;

      case AlarmParticipantStatus.NOT_GOING:
        summary.notGoing++;
        break;

      case AlarmParticipantStatus.NO_ANSWER:
        summary.noAnswer++;
        break;
    }
  }

  return {
    alarmId,
    ...summary,
  };
}

async finish(alarmId: number): Promise<Alarm> {
  const alarm = await this.alarmRepository.findOne({
    where: {
      id: alarmId,
    },
  });

  if (!alarm) {
    throw new NotFoundException(
      `Alarm ${alarmId} nie istnieje.`,
    );
  }

  if (alarm.status === AlarmStatus.FINISHED) {
    throw new ConflictException(
      `Alarm ${alarmId} został już zakończony.`,
    );
  }

  alarm.status = AlarmStatus.FINISHED;
  alarm.finishedAt = new Date();

  return this.alarmRepository.save(alarm);
}
}