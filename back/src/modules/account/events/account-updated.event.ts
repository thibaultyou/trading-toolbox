import { Account } from '../entities/account.entity';

export class AccountUpdatedEvent {
  public readonly account: Account;

  constructor(account: Account) {
    this.account = account;
  }
}
