import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'ccxt';

export class PositionClosedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly order: Order;

  constructor(accountId: string, order: Order) {
    this.accountId = accountId;
    this.order = order;
  }
}
