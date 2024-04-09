import { Order } from 'ccxt';

export class OrdersUpdatedEvent {
  public readonly accountId: string;

  public readonly orders: Order[];

  constructor(accountId: string, orders: Order[]) {
    this.accountId = accountId;
    this.orders = orders;
  }
}
