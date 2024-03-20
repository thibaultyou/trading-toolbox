import { ApiProperty } from '@nestjs/swagger';

import { Setup } from '../../_setup/entities/setup.entity';

export class AlertReceivedEvent {
  @ApiProperty()
  public readonly setup: Setup;

  constructor(setup: Setup) {
    this.setup = setup;
  }
}
