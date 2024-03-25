import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'ccxt';

export class OrdersUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty({ type: () => [Object] })
  public readonly orders: Order[];

  constructor(accountId: string, orders: Order[]) {
    this.accountId = accountId;
    this.orders = orders;
  }
}
