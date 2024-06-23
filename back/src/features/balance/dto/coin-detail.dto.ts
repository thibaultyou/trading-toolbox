import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { ICoinData } from '../types/coin-data.interface';

export class CoinDetailDto implements ICoinData {
  @ApiProperty({ example: 'USDT', description: 'Name of the coin' })
  @IsString()
  coin: string;

  @ApiProperty({ example: '576.6633424', description: 'Equity of the coin' })
  @IsString()
  equity: string;

  @ApiProperty({ example: '617.4637424', description: 'Wallet balance of the coin' })
  @IsString()
  walletBalance: string;

  @ApiProperty({ example: '471.03640355', description: 'Amount available to withdraw' })
  @IsString()
  availableToWithdraw: string;

  @ApiProperty({ example: '-40.8004', required: false, description: 'Unrealised PnL' })
  @IsString()
  @IsOptional()
  unrealisedPnl?: string;

  @ApiProperty({ example: '1473.2599796', required: false, description: 'Cumulative realised PnL' })
  @IsString()
  @IsOptional()
  cumRealisedPnl?: string;

  constructor(data: ICoinData) {
    this.coin = data.coin;
    this.equity = data.equity;
    this.walletBalance = data.walletBalance;
    this.availableToWithdraw = data.availableToWithdraw;
    this.unrealisedPnl = data.unrealisedPnl;
    this.cumRealisedPnl = data.cumRealisedPnl;
  }
}
