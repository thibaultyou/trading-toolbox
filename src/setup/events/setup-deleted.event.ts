import { ApiProperty } from '@nestjs/swagger';

export class SetupDeletedEvent {
  @ApiProperty()
  public readonly setupId: string;

  constructor(setupId: string) {
    this.setupId = setupId;
  }
}
