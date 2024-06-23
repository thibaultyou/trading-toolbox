import { Order } from 'ccxt';

import { IOrder } from './order.interfaces';
import { OrderSide, OrderType } from './order.types';

export class OrderConverter {
  static toInternalOrder(order: Order): IOrder {
    return {
      id: order.info.orderId,
      linkId: order.info.orderLinkId,
      marketId: order.info.symbol,
      price: parseFloat(order.info.price),
      amount: order.amount,
      side: order.info.side.toLowerCase() === 'buy' ? OrderSide.BUY : OrderSide.SELL,
      status: order.status,
      type: order.info.orderType.toLowerCase() === 'limit' ? OrderType.LIMIT : OrderType.MARKET,
      leavesQty: parseFloat(order.info.leavesQty),
      tpslMode: order.info.tpslMode,
      triggerPrice: parseFloat(order.info.triggerPrice),
      createdTime: parseInt(order.info.createdTime),
      updatedTime: parseInt(order.info.updatedTime)
    };
  }
}
