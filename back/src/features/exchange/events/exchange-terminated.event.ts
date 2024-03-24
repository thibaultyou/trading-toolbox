import { ApiProperty } from '@nestjs/swagger';

export class ExchangeTerminatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }
}
