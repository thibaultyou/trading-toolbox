import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { AccountService } from '../../account/account.service';

export const ValidateAccount = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  console.log('ValidateAccount');
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  const accountId = request.params.accountId;
  const accountService = request.app.get(AccountService);

  try {
    await accountService.validateUserAccount(user, accountId);
  } catch (error) {
    throw new UnauthorizedException('You do not have access to this account');
  }
  return accountId;
});
