import { OrderSide } from './order-side.enum';
import { OrderType } from './order-type.enum';

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
  tpslMode: string;
  triggerPrice: number;
  createdTime: number;
  updatedTime: number;
}
