import { ApiProperty } from '@nestjs/swagger';

export class TickersUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty({ type: () => [String] })
  public readonly marketIds: string[];

  constructor(accountId: string, marketIds: string[]) {
    this.accountId = accountId;
    this.marketIds = marketIds;
  }
}
