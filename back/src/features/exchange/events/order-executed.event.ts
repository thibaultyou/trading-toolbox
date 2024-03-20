import { ApiProperty } from '@nestjs/swagger';

import { OrderExecutionData } from '../exchange.types';

export class OrderExecutedEvent {
  @ApiProperty()
  public readonly accountName: string;

  @ApiProperty()
  public readonly data: OrderExecutionData[];

  constructor(accountName: string, data: OrderExecutionData[]) {
    this.accountName = accountName;
    this.data = data;
  }
}
