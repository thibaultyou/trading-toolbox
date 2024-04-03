import { ApiProperty } from '@nestjs/swagger';
import { Balances } from 'ccxt';

import { AccountDetailDto } from './account-detail.dto';

export class BalanceReadResponseDto {
  @ApiProperty({ type: [AccountDetailDto], description: 'List of account details' })
  accounts: AccountDetailDto[];

  @ApiProperty({ example: 1712075859925, description: 'Timestamp of the balance snapshot' })
  timestamp: number;

  @ApiProperty({ example: '2024-04-02T16:37:39.925Z', description: 'Datetime of the balance snapshot in ISO format' })
  datetime: string;

  @ApiProperty({ example: 471.03640355, description: 'Free balance available' })
  free: number;

  @ApiProperty({ example: 146.42733885, description: 'Used balance' })
  used: number;

  @ApiProperty({ example: 617.4637424, description: 'Total balance' })
  total: number;

  constructor(balances: Balances, currency: string = 'USDT') {
    if (!balances || !balances.info || !Array.isArray(balances.info.result.list)) {
      // TODO improve
      throw new Error('Invalid balance data structure');
    }

    this.timestamp = balances.timestamp;
    this.datetime = balances.datetime;
    this.free = balances.free?.[currency] ?? 0;
    this.used = balances.used?.[currency] ?? 0;
    this.total = balances.total?.[currency] ?? 0;

    this.accounts = balances.info.result.list.map(
      (account: Partial<AccountDetailDto>) => new AccountDetailDto(account)
    );
  }
}
