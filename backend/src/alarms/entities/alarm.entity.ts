import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AlarmStatus {
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
}

@Entity()
export class Alarm {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: AlarmStatus,
    default: AlarmStatus.RUNNING,
  })
  status!: AlarmStatus;

  @Column()
  createdByUserId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  finishedAt!: Date | null;
}