import { Position } from 'ccxt';

import { OrderSide } from '@order/types/order-side.enum';

import { IPosition } from './types/position.interface';

export const fromPositionToInternalPosition = (position: Position): IPosition => ({
  marketId: fromSymbolToMarketId(position.symbol),
  side: position.info.side.toLowerCase() === 'buy' ? OrderSide.BUY : OrderSide.SELL,
  avgPrice: position.entryPrice,
  positionValue: position.notional,
  leverage: position.leverage,
  unrealisedPnl: position.unrealizedPnl,
  markPrice: position.markPrice,
  amount: position.contracts,
  tpslMode: position.info.tpslMode
  // takeProfitPrice: position.info.takeProfitPrice || 0,
  // stopLossPrice: position.info.stopLossPrice || 0,
});

export const fromSymbolToMarketId = (symbol: string): string => {
  const parts = symbol.split(':')[0].split('/');
  return parts.join('');
};
