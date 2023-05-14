import { ApiProperty } from '@nestjs/swagger';

export class PositionUpdatedEvent {
  @ApiProperty()
  public readonly positions: any[]; // replace with your position type

  constructor(positions: any[]) {
    // replace with your position type
    this.positions = positions;
  }
}
