import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
  })
  user!: User;

  @Column()
  userId!: number;

  @Column()
  tokenHash!: string;

  @Column({
    type: 'timestamp',
  })
  expiresAt!: Date;

  @Column({
    nullable: true,
  })
  device!: string;

  @Column({
    nullable: true,
  })
  ip!: string;

  @CreateDateColumn()
  createdAt!: Date;
}