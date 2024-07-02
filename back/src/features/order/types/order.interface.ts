import { OrderSide } from './order-side.enum';
import { OrderType } from './order-type.enum';
import { TPSLMode } from './tpsl-mode.enum';

export interface IOrder {
  id: string;
  linkId: string;
  marketId: string;
  price: number;
  amount: number;
  side: OrderSide;
  status: string;
  type: OrderType;
  leavesQty: number;
  tpslMode: TPSLMode;
  triggerPrice: number;
  createdTime: number;
  updatedTime: number;
}
