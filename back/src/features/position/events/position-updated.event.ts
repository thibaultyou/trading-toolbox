import { ApiProperty } from '@nestjs/swagger';

import { IPosition } from '../position.interface';

export class PositionUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly position: IPosition;

  constructor(accountId: string, position: IPosition) {
    this.accountId = accountId;
    this.position = position;
  }
}
