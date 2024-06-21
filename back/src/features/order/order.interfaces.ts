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
