import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { User } from '../entities/user.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = User>(err: any, user: TUser, info: any, context: ExecutionContext, _status?: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }

    const request = context.switchToHttp().getRequest();
    request.user = user;
    return user;
  }
}
