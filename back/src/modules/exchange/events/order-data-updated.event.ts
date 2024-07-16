import { ApiProperty } from '@nestjs/swagger';

import { IOrderData } from '../types/order-data.interface';

export class OrderDataUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly data: IOrderData[];

  constructor(accountId: string, data: IOrderData[]) {
    this.accountId = accountId;
    this.data = data;
  }
}
