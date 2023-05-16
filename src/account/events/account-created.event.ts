import { Account } from '../entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';

export class AccountCreatedEvent {
  @ApiProperty({ type: () => Account })
  public readonly account: Account;

  constructor(account: Account) {
    this.account = account;
  }
}
