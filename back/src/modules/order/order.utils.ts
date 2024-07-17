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
