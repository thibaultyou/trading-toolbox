import { ApiProperty } from '@nestjs/swagger';

import { TickerData } from '../ticker.types';

export class TickerDataUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly marketId: string;

  @ApiProperty()
  public readonly data: TickerData;

  constructor(accountId: string, marketId: string, data: TickerData) {
    this.accountId = accountId;
    this.marketId = marketId;
    this.data = data;
  }
}
