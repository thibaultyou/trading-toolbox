import { ApiProperty } from '@nestjs/swagger';
import { Market } from 'ccxt';

import { Limits, Precision } from '../../exchange/exchange.types';

export class MarketResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  base: string;

  @ApiProperty()
  quote: string;

  @ApiProperty()
  precision: Precision;

  @ApiProperty()
  limits: Limits;

  constructor(market: Market) {
    this.id = market.id;
    this.symbol = market.symbol;
    this.base = market.base;
    this.quote = market.quote;
    this.precision = market.precision;
    this.limits = market.limits;
  }
}
