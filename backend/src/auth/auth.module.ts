import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

import { UsersModule } from '../users/users.module';
import { RefreshToken } from './entities/refresh-token.entity';

import { RefreshTokensService } from './refresh-tokens.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RefreshToken,
    ]),

    UsersModule,

    PassportModule,

    JwtModule.register({
      secret: 'gpr-super-secret-key',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
  AuthService,
  JwtStrategy,
  RefreshTokensService,
],

  exports: [
    TypeOrmModule,
  ],
})
export class AuthModule {}