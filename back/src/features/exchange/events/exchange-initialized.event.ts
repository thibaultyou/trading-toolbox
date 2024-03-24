import { ApiProperty } from '@nestjs/swagger';

import { ExchangeType } from '../exchange.types';

export class ExchangeInitializedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty({ enum: ExchangeType })
  public readonly exchangeType: ExchangeType;

  constructor(accountId: string, exchangeType: ExchangeType) {
    this.accountId = accountId;
    this.exchangeType = exchangeType;
  }
}
