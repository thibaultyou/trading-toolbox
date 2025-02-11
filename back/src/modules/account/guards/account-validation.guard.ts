import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccountService } from '@account/account.service';
import { VALIDATE_ACCOUNT_KEY } from '@config';

@Injectable()
export class AccountValidationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private accountService: AccountService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validateAccount = this.reflector.get<boolean>(VALIDATE_ACCOUNT_KEY, context.getHandler());

    if (!validateAccount) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const accountId = request.params.accountId;

    if (!userId || !accountId) {
      throw new UnauthorizedException('Invalid request');
    }

    try {
      await this.accountService.validateUserAccount(userId, accountId);
      return true;
    } catch (error) {
      throw new UnauthorizedException('You do not have access to this account');
    }
  }
}
