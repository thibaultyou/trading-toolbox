import { Injectable } from '@nestjs/common';
import { Position } from 'ccxt';

import { OrderSide } from '@order/types/order-side.enum';
import { PositionDto } from '@position/dtos/position.dto';
import { IPosition } from '@position/types/position.interface';

@Injectable()
export class PositionMapperService {
  toDto(position: IPosition): PositionDto {
    return new PositionDto(position);
  }

  fromExternalPosition(position: Position): IPosition {
    return {
      marketId: this.fromSymbolToMarketId(position.symbol),
      side: position.info.side.toLowerCase() === 'buy' ? OrderSide.BUY : OrderSide.SELL,
      avgPrice: position.entryPrice,
      positionValue: position.notional,
      leverage: position.leverage,
      unrealisedPnl: position.unrealizedPnl,
      markPrice: position.markPrice,
      amount: position.contracts,
      tpslMode: position.info.tpslMode
    };
  }

  private fromSymbolToMarketId(symbol: string): string {
    const parts = symbol.split(':')[0].split('/');
    return parts.join('');
  }
}
