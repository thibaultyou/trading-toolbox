import { ApiProperty } from '@nestjs/swagger';

import { Account } from '../entities/account.entity';

export class AccountCreatedEvent {
  @ApiProperty({ type: () => Account })
  public readonly account: Account;

  constructor(account: Account) {
    this.account = account;
  }
}
