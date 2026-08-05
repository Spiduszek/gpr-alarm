import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AlarmPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum AlarmStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
}

@Entity()
export class Alarm {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  title!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string;

  @Column({ length: 255 })
  location!: string;

  @Column({
    type: 'enum',
    enum: AlarmPriority,
    default: AlarmPriority.MEDIUM,
  })
  priority!: AlarmPriority;

  @Column({
    type: 'enum',
    enum: AlarmStatus,
    default: AlarmStatus.DRAFT,
  })
  status!: AlarmStatus;

  @CreateDateColumn()
  createdAt!: Date;
}