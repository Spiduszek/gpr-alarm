import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';

import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

import { LoginResponseDto } from './dto/login-response.dto';
import { MeDto } from './dto/me.dto';
import { RefreshTokensService } from './refresh-tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokensService: RefreshTokensService,
  ) {}

  async login(
    login: string,
    password: string,
  ): Promise<LoginResponseDto> {
    const user = await this.usersService.findByLogin(login);

    if (!user) {
      throw new UnauthorizedException(
        'Nieprawidłowy login lub hasło.',
      );
    }

    if (!user.active) {
      throw new UnauthorizedException(
        'Konto jest nieaktywne.',
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Nieprawidłowy login lub hasło.',
      );
    }

    return this.createTokenPair(user);
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }

  private async createTokenPair(
    user: User,
  ): Promise<LoginResponseDto> {
    const accessPayload = {
      sub: user.id,
      login: user.login,
      role: user.role,
    };

    const refreshPayload = {
      sub: user.id,
      login: user.login,
      role: user.role,
      jti: randomUUID(),
    };

    const accessToken = this.jwtService.sign(
      accessPayload,
      {
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      refreshPayload,
      {
        expiresIn: '30d',
      },
    );

    const tokenHash = this.hashRefreshToken(
      refreshToken,
    );

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + 30,
    );

    await this.refreshTokensService.deleteAllForUser(
      user.id,
    );

    await this.refreshTokensService.create(
      user.id,
      tokenHash,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async me(userId: number): Promise<MeDto> {
    const user = await this.usersService.findOne(
      userId,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Użytkownik nie istnieje.',
      );
    }

    return {
      id: user.id,
      login: user.login,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      active: user.active,
    };
  }

  async refresh(
    refreshToken: string,
  ): Promise<LoginResponseDto> {
    let payload: {
      sub: number;
      login: string;
      role: string;
      jti?: string;
    };

    // 1. Sprawdzamy podpis i ważność JWT.
    try {
      payload = this.jwtService.verify(
        refreshToken,
      );
    } catch {
      throw new UnauthorizedException(
        'Refresh token jest nieprawidłowy lub wygasł.',
      );
    }

    // 2. Pobieramy użytkownika.
    const user = await this.usersService.findOne(
      payload.sub,
    );

    if (!user) {
      throw new UnauthorizedException(
        'Użytkownik nie istnieje.',
      );
    }

    if (!user.active) {
      throw new UnauthorizedException(
        'Konto jest nieaktywne.',
      );
    }

    // 3. Pobieramy aktualną sesję użytkownika.
    const storedTokens =
      await this.refreshTokensService.findByUser(
        user.id,
      );

    if (storedTokens.length === 0) {
      throw new UnauthorizedException(
        'Brak aktywnej sesji.',
      );
    }

    const storedToken = storedTokens[0];

    // 4. Hashujemy token otrzymany od klienta.
    const incomingTokenHash =
      this.hashRefreshToken(refreshToken);

    // 5. Hash musi być IDENTYCZNY z tym w bazie.
    if (
      incomingTokenHash !==
      storedToken.tokenHash
    ) {
      throw new UnauthorizedException(
        'Refresh token jest nieprawidłowy.',
      );
    }

    // 6. Dodatkowo sprawdzamy datę ważności
    // rekordu w bazie.
    if (
      storedToken.expiresAt.getTime() <=
      Date.now()
    ) {
      await this.refreshTokensService.delete(
        storedToken.id,
      );

      throw new UnauthorizedException(
        'Refresh token wygasł.',
      );
    }

    // 7. Stary token był prawidłowy.
    // createTokenPair usunie go i zapisze nowy.
    return this.createTokenPair(user);
  }
}