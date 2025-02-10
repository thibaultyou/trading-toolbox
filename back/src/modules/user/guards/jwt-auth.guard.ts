import { ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { User } from '../entities/user.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = User>(err: any, user: TUser, info: any, context: ExecutionContext, _status?: any): TUser {
    // NOTE Avoiding logs here to prevent high frequency noise
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const url = request.url;
    // this.logger.debug(`handleRequest() - start | IP=${ip}, URL=${url}`);

    if (err || !user) {
      this.logger.warn(`handleRequest() - unauthorized | IP=${ip}, URL=${url}, reason=${info?.message || info}`);
      throw err || new UnauthorizedException('Authentication failed');
    }

    // this.logger.debug(`handleRequest() - success | userId=${user['id'] ?? 'unknown'}, IP=${ip}, URL=${url}`);
    request.user = user;
    return user;
  }
}
