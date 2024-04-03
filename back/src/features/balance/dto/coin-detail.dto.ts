import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CoinDetailDto {
  @ApiProperty({ example: 'USDT', description: 'Name of the coin' })
  @IsString()
  coin: string;

  @ApiProperty({ example: 576.6633424, description: 'Equity of the coin' })
  @IsNumber()
  equity: number;

  // @ApiProperty({ example: '617.4637424', required: false, description: 'USD value of the coin' })
  // @IsNumber()
  // @IsOptional()
  // usdValue?: number;

  @ApiProperty({ example: 617.4637424, description: 'Wallet balance of the coin' })
  @IsNumber()
  walletBalance: number;

  @ApiProperty({ example: 471.03640355, description: 'Amount available to withdraw' })
  @IsNumber()
  availableToWithdraw: number;

  @ApiProperty({ example: -40.8004, required: false, description: 'Unrealised PnL' })
  @IsNumber()
  @IsOptional()
  unrealisedPnl?: number;

  @ApiProperty({ example: 1473.2599796, required: false, description: 'Cumulative realised PnL' })
  @IsNumber()
  @IsOptional()
  cumRealisedPnl?: number;

  constructor(data: any) {
    this.coin = data.coin;
    this.equity = parseFloat(data.equity);
    // this.usdValue = parseFloat(data.usdValue);
    this.walletBalance = parseFloat(data.walletBalance);
    this.availableToWithdraw = parseFloat(data.availableToWithdraw);
    this.unrealisedPnl = data.unrealisedPnl ? parseFloat(data.unrealisedPnl) : undefined;
    this.cumRealisedPnl = data.cumRealisedPnl ? parseFloat(data.cumRealisedPnl) : undefined;
  }
}
