import { ApiProperty } from '@nestjs/swagger';

import { IPositionData } from '../types/position-data.interface';

export class PositionDataUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly data: IPositionData[];

  constructor(accountId: string, data: IPositionData[]) {
    this.accountId = accountId;
    this.data = data;
  }
}
