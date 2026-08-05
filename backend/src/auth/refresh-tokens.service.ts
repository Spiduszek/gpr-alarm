import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async create(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
    device?: string,
    ip?: string,
  ): Promise<RefreshToken> {
    const token = this.repository.create({
      userId,
      tokenHash,
      expiresAt,
      device,
      ip,
    });

    const saved = await this.repository.save(token);

    console.log(
      `[REFRESH DB] CREATED id=${saved.id}, userId=${saved.userId}`,
    );

    return saved;
  }

  async findByUser(userId: number): Promise<RefreshToken[]> {
    const tokens = await this.repository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    console.log(
      `[REFRESH DB] FOUND userId=${userId}, ids=${tokens
        .map((token) => token.id)
        .join(',')}`,
    );

    return tokens;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);

    console.log(`[REFRESH DB] DELETED id=${id}`);
  }

  async deleteAllForUser(userId: number): Promise<void> {
    const result = await this.repository.delete({
      userId,
    });

    console.log(
      `[REFRESH DB] DELETE ALL userId=${userId}, affected=${result.affected}`,
    );
  }
}