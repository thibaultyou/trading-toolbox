import { MarketType } from 'ccxt';

import { IExchangeLimits } from '@exchange/types/exchange-limits.interface';

import { IMarketPrecision } from './market-precision.interface';

export interface IMarket {
  id: string;
  symbol: string;
  base: string;
  quote: string;
  precision: IMarketPrecision;
  limits: IExchangeLimits;
  active: boolean;
  type: MarketType;
  contract: boolean;
}
