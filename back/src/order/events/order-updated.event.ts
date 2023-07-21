import { ApiProperty } from '@nestjs/swagger';

export class OrderUpdatedEvent {
  @ApiProperty()
  public readonly accountName: string;

  @ApiProperty({ type: () => [Object] })
  public readonly orders: any[];

  constructor(accountName: string, orders: any[]) {
    this.accountName = accountName;
    this.orders = orders;
  }
}
