import { ApiProperty } from '@nestjs/swagger';

import { MarketResponseDto } from './market.response.dto';

export class MarketListResponseDto {
  @ApiProperty()
  accountName: string;

  @ApiProperty({ type: [MarketResponseDto] })
  markets: MarketResponseDto[];

  constructor(accountName: string, markets: MarketResponseDto[]) {
    this.accountName = accountName;
    this.markets = markets;
  }
}
