import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AlarmParticipantStatus {
  PENDING = 'PENDING',
  GOING = 'GOING',
  NOT_GOING = 'NOT_GOING',
  NO_ANSWER = 'NO_ANSWER',
}

@Entity()
export class AlarmParticipant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  alarmId!: number;

  @Column()
  userId!: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  firstName!: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  lastName!: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  phone!: string | null;

  @Column({
    type: 'enum',
    enum: AlarmParticipantStatus,
    default: AlarmParticipantStatus.PENDING,
  })
  status!: AlarmParticipantStatus;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  answeredAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}