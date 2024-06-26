import { Position } from 'ccxt';

import { convertSymbolToMarketId } from '../../common/utils/symbol.util';
import { OrderSide } from '../order/types/order-side.enum';
import { IPosition } from './position.interface';

export const fromPositionToInternalPosition = (position: Position): IPosition => ({
  marketId: convertSymbolToMarketId(position.symbol),
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
