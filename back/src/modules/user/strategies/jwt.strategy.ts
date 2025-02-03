import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { InjectConfig } from '@common/decorators/inject-env.decorator';
import { IEnvConfiguration } from '@config';
import { UserDto } from '@user/dtos/user.dto';

import { UserService } from '../user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectConfig() private config: IEnvConfiguration,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.JWT_SIGNING_SECRET
    });
  }

  async validate(payload: any): Promise<UserDto> {
    return await this.userService.getUserById(payload.sub);
  }
}
