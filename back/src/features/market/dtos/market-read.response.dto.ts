import { ApiProperty } from '@nestjs/swagger';
import { Market } from 'ccxt';

import { IExchangeLimits } from '@exchange/types/exchange-limits.interface';

import { IMarketPrecision } from '../types/market-precision.interface';
import { MarketType } from '../types/market-type.enum';

export class MarketReadResponseDto {
  @ApiProperty({
    description: 'The unique identifier for the market.',
    example: 'BTCUSDT'
  })
  id: string;

  @ApiProperty({
    description: 'The trading symbol for the market.',
    example: 'BTC/USD'
  })
  symbol: string;

  @ApiProperty({
    description: 'The base currency of the market pair.',
    example: 'BTC'
  })
  base: string;

  @ApiProperty({
    description: 'The quote currency of the market pair.',
    example: 'USD'
  })
  quote: string;

  @ApiProperty({
    description: 'The precision levels for amount and price in the market.',
    example: { amount: 8, price: 2 }
  })
  precision: IMarketPrecision;

  @ApiProperty({
    description: 'The minimum and maximum limits for amount, price, and cost in the market.',
    example: { amount: { min: 0.01, max: 100 }, price: { min: 0.01, max: 100000 }, cost: { min: 10, max: 1000000 } }
  })
  limits: IExchangeLimits;

  @ApiProperty({
    description: 'Indicates whether the market is currently active.',
    example: true
  })
  active: boolean;

  @ApiProperty({
    description: 'The type of the market (e.g., spot, margin, swap, future, option).',
    enum: MarketType,
    example: MarketType.Spot
  })
  type: Market['type'];

  constructor(market: Market) {
    this.id = market.id;
    this.symbol = market.symbol;
    this.base = market.base;
    this.quote = market.quote;
    this.precision = market.precision;
    this.limits = market.limits;
    this.active = market.active;
    this.type = market.type;
  }
}
