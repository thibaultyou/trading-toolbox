import { ApiProperty } from '@nestjs/swagger';

import { ExchangeType } from '../exchange.types';

export class ExchangeTerminatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty({ enum: ExchangeType })
  public readonly exchangeType: ExchangeType;

  constructor(accountId: string, exchangeType: ExchangeType) {
    this.accountId = accountId;
    this.exchangeType = exchangeType;
  }
}
