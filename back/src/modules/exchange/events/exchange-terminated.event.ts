import { ExchangeType } from '@exchange/types/exchange-type.enum';

export class ExchangeTerminatedEvent {
  public readonly accountId: string;
  public readonly exchangeType: ExchangeType;

  constructor(accountId: string, exchangeType: ExchangeType) {
    this.accountId = accountId;
    this.exchangeType = exchangeType;
  }
}
