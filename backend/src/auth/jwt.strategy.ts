import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'gpr-super-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('========== JWT ==========');
    console.log(payload);
    console.log('=========================');

    return {
      id: payload.sub,
      login: payload.login,
      role: payload.role,
    };
  }
}