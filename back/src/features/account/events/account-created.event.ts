import { Account } from '../entities/account.entity';

export class AccountCreatedEvent {
  public readonly account: Account;

  constructor(account: Account) {
    this.account = account;
  }
}
