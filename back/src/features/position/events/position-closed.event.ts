import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'ccxt';

export class PositionsClosedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty({ type: () => Object })
  public readonly order: Order;

  constructor(accountId: string, order: Order) {
    this.accountId = accountId;
    this.order = order;
  }
}
