import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { InjectConfig } from '@common/decorators/inject-env.decorator';
import { Config } from '@config/env.config';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectConfig() private config: Config,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.JWT_SECRET
    });
  }

  async validate(payload: any): Promise<User> {
    return await this.authService.validateUserById(payload.sub);
  }
}
