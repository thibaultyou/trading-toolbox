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
    // --- 1) Determine side (BUY or SELL) ---
    // Bybit shape: position.info.side === 'Buy' || 'Sell'
    // Bitget shape: position.info.holdSide === 'long' || 'short'
    // Fallback: 'BUY' if unknown
    const sideString = this.getSideString(position.info);

    const side = sideString === 'long' || sideString === 'buy' ? OrderSide.BUY : OrderSide.SELL;

    // --- 2) Build IPosition ---
    return {
      marketId: this.fromSymbolToMarketId(position.symbol),
      side,
      avgPrice: position.entryPrice,
      positionValue: position.notional,
      leverage: position.leverage,
      unrealisedPnl: position.unrealizedPnl,
      markPrice: position.markPrice,
      amount: position.contracts,
      stopLossPrice: position.stopLossPrice,
      takeProfitPrice: position.takeProfitPrice,
      tpslMode: position.info.tpslMode ?? 'FULL'
    };
  }

  private getSideString(info: any): string {
    if (info.side) {
      return info.side.toLowerCase(); // e.g. 'buy' / 'sell'
    }
    if (info.holdSide) {
      return info.holdSide.toLowerCase(); // e.g. 'long' / 'short'
    }
    return 'buy'; // fallback
  }

  // TODO instead of using getSideString returning a string we should probably use a unified way to return an OrderSide since long = buy and short = sell, we don't want to use different terminologies

  private fromSymbolToMarketId(symbol: string): string {
    const parts = symbol.split(':')[0].split('/');
    return parts.join('');
  }
}
