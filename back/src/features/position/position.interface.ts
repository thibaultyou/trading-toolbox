import { OrderSide } from '../order/types/order-side.enum';
import { TPSLMode } from '../order/types/tpsl-mode.enum';

export interface IPosition {
  marketId: string;
  side: OrderSide;
  avgPrice: number;
  positionValue: number;
  leverage: number;
  unrealisedPnl: number;
  markPrice: number;
  amount: number;
  tpslMode: TPSLMode;
  // takeProfitPrice: number;
  // stopLossPrice: number;
  // createdTime: number;
  // updatedTime: number;
}
