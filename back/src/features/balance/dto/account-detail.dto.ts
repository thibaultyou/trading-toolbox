import { ApiProperty } from '@nestjs/swagger';

import { CoinDetailDto } from './coin-detail.dto';

export class AccountDetailDto {
  @ApiProperty({ example: 'CONTRACT', description: 'Type of the account' })
  accountType: string;

  //   @ApiProperty({ example: '10000', required: false, description: 'Total equity of the account' })
  //   totalEquity?: string;

  @ApiProperty({ type: [CoinDetailDto], description: 'Details of the coins within the account' })
  coins: CoinDetailDto[];

  constructor(account: any) {
    this.accountType = account.accountType;
    // this.totalEquity = account.totalEquity;
    this.coins = account.coin.map((coin: Partial<CoinDetailDto>) => new CoinDetailDto(coin));
  }
}
