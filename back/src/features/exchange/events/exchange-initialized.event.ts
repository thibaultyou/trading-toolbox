import { ApiProperty } from '@nestjs/swagger';

export class ExchangeInitializedEvent {
  @ApiProperty()
  public readonly accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }
}
