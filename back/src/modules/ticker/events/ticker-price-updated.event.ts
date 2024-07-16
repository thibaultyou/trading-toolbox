import { ApiProperty } from '@nestjs/swagger';

export class TickerPriceUpdatedEvent {
  @ApiProperty()
  public readonly accountId: string;

  @ApiProperty()
  public readonly marketId: string;

  @ApiProperty()
  public readonly price: number;

  constructor(accountId: string, marketId: string, price: number) {
    this.accountId = accountId;
    this.marketId = marketId;
    this.price = price;
  }
}
