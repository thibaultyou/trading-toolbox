import { OrderSide } from '../order/types/order-side.enum';

export interface IPosition {
  marketId: string;
  side: OrderSide;
  avgPrice: number;
  positionValue: number;
  leverage: number;
  unrealisedPnl: number;
  markPrice: number;
  amount: number;
  tpslMode: string;
  // takeProfitPrice: number;
  // stopLossPrice: number;
  // createdTime: number;
  // updatedTime: number;
}
