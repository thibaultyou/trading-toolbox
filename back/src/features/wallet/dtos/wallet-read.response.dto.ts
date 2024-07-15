import { ApiProperty } from '@nestjs/swagger';

import { CoinDetailDto } from './coin-detail.dto';
import { IWalletAccount } from '../types/wallet-account.interface';

export class WalletReadResponseDto {
  @ApiProperty({ example: 'CONTRACT', description: 'Type of account' })
  accountType: string;

  @ApiProperty({ type: [CoinDetailDto], description: 'Details of the coins in the account' })
  coin: CoinDetailDto[];

  @ApiProperty({ example: 339.6886836, description: 'Free balance available' })
  free: number;

  @ApiProperty({ example: 165.57401988, description: 'Used balance' })
  used: number;

  @ApiProperty({ example: 505.26219184, description: 'Total balance' })
  total: number;

  constructor(walletContractAccount: IWalletAccount, currency: string = 'USDT') {
    this.accountType = walletContractAccount.accountType;

    const coinData = walletContractAccount.coin.find((c) => c.coin === currency);

    if (coinData) {
      const coinDetail = new CoinDetailDto(coinData);
      this.coin = [coinDetail];
      this.free = parseFloat(coinData.availableToWithdraw);
      this.total = parseFloat(coinData.equity);
      this.used = this.total - this.free;
    } else {
      this.coin = [];
      this.free = 0;
      this.total = 0;
      this.used = 0;
    }
  }
}
