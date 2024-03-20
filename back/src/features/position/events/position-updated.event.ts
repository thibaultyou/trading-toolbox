import { ApiProperty } from '@nestjs/swagger';

export class PositionUpdatedEvent {
  @ApiProperty()
  public readonly accountName: string;

  @ApiProperty()
  public readonly positions: any[];

  constructor(accountName: string, positions: any[]) {
    this.accountName = accountName;
    this.positions = positions;
  }
}
