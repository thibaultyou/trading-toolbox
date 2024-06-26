import { Order } from 'ccxt';

import { IOrder } from './types/order.interface';
import { OrderSide } from './types/order-side.enum';
import { OrderType } from './types/order-type.enum';

export const fromOrdertoInternalOrder = (order: Order): IOrder => ({
  id: order.info.orderId,
  linkId: order.info.orderLinkId,
  marketId: order.info.symbol,
  price: parseFloat(order.info.price),
  amount: order.amount,
  side: order.side.toLowerCase() === 'buy' ? OrderSide.BUY : OrderSide.SELL,
  status: order.status,
  type: order.info.orderType.toLowerCase() === 'limit' ? OrderType.LIMIT : OrderType.MARKET,
  leavesQty: parseFloat(order.info.leavesQty),
  tpslMode: order.info.tpslMode,
  triggerPrice: parseFloat(order.info.triggerPrice),
  createdTime: parseInt(order.info.createdTime),
  updatedTime: parseInt(order.info.updatedTime)
});
