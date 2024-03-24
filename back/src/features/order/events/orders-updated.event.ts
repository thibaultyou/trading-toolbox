import { ApiProperty } from '@nestjs/swagger';

export class OrdersUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty({ type: () => [Object] })
  public readonly orders: any[];

  constructor(accountId: string, orders: any[]) {
    this.accountId = accountId;
    this.orders = orders;
  }
}
