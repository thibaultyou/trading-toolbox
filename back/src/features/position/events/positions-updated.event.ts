import { ApiProperty } from '@nestjs/swagger';
import { Position } from 'ccxt';

export class PositionsUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly positions: Position[];

  constructor(accountId: string, positions: Position[]) {
    this.accountId = accountId;
    this.positions = positions;
  }
}
