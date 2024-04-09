import { Balances } from 'ccxt';

export class BalancesUpdatedEvent {
  public readonly accountId: string;

  public readonly balances: Balances;

  constructor(accountId: string, balances: Balances) {
    this.accountId = accountId;
    this.balances = balances;
  }
}
