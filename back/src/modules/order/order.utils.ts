import { OrderSide } from './types/order-side.enum';
import { IOrder } from './types/order.interface';

export const haveOrdersChanged = (currentOrders: IOrder[], newOrders: IOrder[]): boolean => {
  if (currentOrders.length !== newOrders.length) return true;

  const orderMap = new Map(currentOrders.map((order) => [order.id, order]));
  for (const order of newOrders) {
    const currentOrder = orderMap.get(order.id);

    if (!currentOrder || currentOrder.updatedTime !== order.updatedTime) {
      return true;
    }
  }
  return false;
};

export const getUnifiedOrderSide = (info: any): OrderSide => {
  if (info.side) {
    const side = info.side.toLowerCase();

    if (side === 'buy' || side === 'sell') {
      return side === 'buy' ? OrderSide.BUY : OrderSide.SELL;
    }
  }

  if (info.holdSide) {
    const holdSide = info.holdSide.toLowerCase();

    if (holdSide === 'long') {
      return OrderSide.BUY;
    } else if (holdSide === 'short') {
      return OrderSide.SELL;
    }
  }
  return OrderSide.BUY;
};
