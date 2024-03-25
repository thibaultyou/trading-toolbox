import { ApiProperty } from '@nestjs/swagger';
import { Position } from 'ccxt';

export class PositionsUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty({ type: () => [Object] })
  public readonly positions: Position[];

  constructor(accountId: string, positions: Position[]) {
    this.accountId = accountId;
    this.positions = positions;
  }
}
