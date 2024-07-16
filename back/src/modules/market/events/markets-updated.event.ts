import { Market } from 'ccxt';

export class MarketsUpdatedEvent {
  public readonly accountId: string;

  public readonly markets: Market[];

  constructor(accountId: string, markets: Market[]) {
    this.accountId = accountId;
    this.markets = markets;
  }
}
