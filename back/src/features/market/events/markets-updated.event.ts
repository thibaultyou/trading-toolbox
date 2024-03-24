import { ApiProperty } from '@nestjs/swagger';
import { Market } from 'ccxt';

export class MarketsUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty({ type: () => Object })
  public readonly markets: Market[];

  constructor(accountId: string, markets: Market[]) {
    this.accountId = accountId;
    this.markets = markets;
  }
}
