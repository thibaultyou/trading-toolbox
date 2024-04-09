import { Account } from '../entities/account.entity';

export class AccountDeletedEvent {
  public readonly account: Account;

  constructor(account: Account) {
    this.account = account;
  }
}
