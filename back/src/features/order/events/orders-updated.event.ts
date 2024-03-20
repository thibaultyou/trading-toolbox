import { ApiProperty } from '@nestjs/swagger';

export class OrdersUpdatedEvent {
  @ApiProperty()
  public readonly accountName: string;

  @ApiProperty({ type: () => [Object] })
  public readonly orders: any[];

  constructor(accountName: string, orders: any[]) {
    this.accountName = accountName;
    this.orders = orders;
  }
}
