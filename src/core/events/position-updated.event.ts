import { ApiProperty } from '@nestjs/swagger';

export class PositionUpdatedEvent {
  @ApiProperty()
  public readonly positions: any[];

  constructor(positions: any[]) {
    this.positions = positions;
  }
}
