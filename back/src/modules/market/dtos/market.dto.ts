import { ApiProperty } from '@nestjs/swagger';
import { MarketType } from 'ccxt';
import { IsBoolean, IsEnum, IsObject, IsString } from 'class-validator';

import { IExchangeLimits } from '@exchange/types/exchange-limits.interface';
import { IMarket } from '@market/types/market.interface';

import { IMarketPrecision } from '../types/market-precision.interface';

export class MarketDto implements IMarket {
  @ApiProperty({
    description: 'The unique identifier for the market.',
    example: 'BTCUSDT'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The trading symbol for the market.',
    example: 'BTC/USD'
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'The base currency of the market pair.',
    example: 'BTC'
  })
  @IsString()
  base: string;

  @ApiProperty({
    description: 'The quote currency of the market pair.',
    example: 'USD'
  })
  @IsString()
  quote: string;

  @ApiProperty({
    description: 'The precision levels for amount and price in the market.',
    example: { amount: 8, price: 2 }
  })
  @IsObject()
  precision: IMarketPrecision;

  @ApiProperty({
    description: 'The minimum and maximum limits for amount, price, and cost in the market.',
    example: { amount: { min: 0.01, max: 100 }, price: { min: 0.01, max: 100000 }, cost: { min: 10, max: 1000000 } }
  })
  @IsObject()
  limits: IExchangeLimits;

  @ApiProperty({
    description: 'Indicates whether the market is currently active.',
    example: true
  })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'The type of the market (e.g., spot, margin, swap, future, option).',
    enum: ['spot', 'margin', 'swap', 'future', 'option', 'delivery', 'index'],
    example: 'spot'
  })
  @IsEnum(['spot', 'margin', 'swap', 'future', 'option', 'delivery', 'index'])
  type: MarketType;

  @ApiProperty({
    description: 'Indicates whether the market is a contract market.',
    example: true
  })
  @IsBoolean()
  contract: boolean;

  constructor(market: IMarket) {
    Object.assign(this, market);
  }
}
