import { ApiProperty } from '@nestjs/swagger';

export class PositionsUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly positions: any[];

  constructor(accountId: string, positions: any[]) {
    this.accountId = accountId;
    this.positions = positions;
  }
}
