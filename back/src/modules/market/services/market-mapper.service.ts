import { Injectable } from '@nestjs/common';
import { Market } from 'ccxt';

import { MarketDto } from '@market/dtos/market.dto';
import { IMarket } from '@market/types/market.interface';

@Injectable()
export class MarketMapperService {
  toDto(market: IMarket): MarketDto {
    return new MarketDto(market);
  }

  fromExternalMarket(market: Market): IMarket {
    return {
      id: market.id,
      symbol: market.symbol,
      base: market.base,
      quote: market.quote,
      precision: market.precision,
      limits: market.limits,
      active: market.active,
      type: market.type,
      contract: market.contract || false
    };
  }
}
