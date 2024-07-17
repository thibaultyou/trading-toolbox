import { IMarket } from '@market/types/market.interface';

export class MarketsUpdatedEvent {
  public readonly accountId: string;

  public readonly markets: IMarket[];

  constructor(accountId: string, markets: IMarket[]) {
    this.accountId = accountId;
    this.markets = markets;
  }
}
