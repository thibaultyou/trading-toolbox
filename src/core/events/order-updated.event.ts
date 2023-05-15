import { ApiProperty } from '@nestjs/swagger';

export class OrderUpdatedEvent {
  @ApiProperty({ type: () => [Object] })
  public readonly orders: any[];

  constructor(orders: any[]) {
    this.orders = orders;
  }
}
