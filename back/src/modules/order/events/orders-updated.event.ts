import { IOrder } from '@order/types/order.interface';

export class OrdersUpdatedEvent {
  public readonly accountId: string;

  public readonly orders: IOrder[];

  constructor(accountId: string, orders: IOrder[]) {
    this.accountId = accountId;
    this.orders = orders;
  }
}
