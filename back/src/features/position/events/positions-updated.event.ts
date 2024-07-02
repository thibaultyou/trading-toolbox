import { ApiProperty } from '@nestjs/swagger';

import { IPosition } from '../types/position.interface';

export class PositionsUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly positions: IPosition[];

  constructor(accountId: string, positions: IPosition[]) {
    this.accountId = accountId;
    this.positions = positions;
  }
}
