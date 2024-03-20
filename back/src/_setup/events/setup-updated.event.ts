import { ApiProperty } from '@nestjs/swagger';

import { Setup } from '../entities/setup.entity';

export class SetupUpdatedEvent {
  @ApiProperty()
  public readonly setup: Setup;

  constructor(setup: Setup) {
    this.setup = setup;
  }
}
