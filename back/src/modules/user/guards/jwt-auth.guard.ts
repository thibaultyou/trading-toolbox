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
    const request = context.switchToHttp().getRequest();

    if (err || !user) {
      this.logger.warn(
        `Unauthorized request - IP: ${request.ip} - URL: ${request.url} - Reason: ${info?.message || info}`
      );
      throw err || new UnauthorizedException('Authentication failed');
    }

    this.logger.debug(`Authorized user - AccountID: ${user['id'] ?? 'unknown'}`);
    request.user = user;
    return user;
  }
}
