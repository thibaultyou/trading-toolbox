import { ApiProperty } from '@nestjs/swagger';

import { ITickerData } from '../types/ticker-data.interface';

export class TickerDataUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly marketId: string;

  @ApiProperty()
  public readonly data: ITickerData;

  constructor(accountId: string, marketId: string, data: ITickerData) {
    this.accountId = accountId;
    this.marketId = marketId;
    this.data = data;
  }
}
