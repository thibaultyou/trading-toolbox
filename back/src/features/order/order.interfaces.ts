import { OrderSide, OrderType } from './order.types';

export interface IOrderDetails {
  marketId: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
}

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
