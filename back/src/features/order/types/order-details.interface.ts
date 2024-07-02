import { OrderSide } from './order-side.enum';
import { OrderType } from './order-type.enum';
import { TPSLMode } from './tpsl-mode.enum';

export interface IOrderDetails {
  marketId: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  tpslMode?: TPSLMode;
}
