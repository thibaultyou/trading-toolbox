import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Balances } from 'ccxt';

import { BaseController } from '../common/base/base.controller';
import { BalanceService } from './balance.service';
import { USDTBalance } from './balance.types';

@ApiTags('Balances')
@Controller('balances')
export class BalanceController extends BaseController {
  constructor(private readonly balanceService: BalanceService) {
    super('Balances');
  }

  @Get('/:accountId')
  @ApiOperation({ summary: 'Fetch balances for a specific account' })
  getAccountBalances(@Param('accountId') accountId: string): Balances {
    return this.balanceService.getAccountBalances(accountId);
  }

  @Get('/:accountId/usdt')
  @ApiOperation({ summary: 'Fetch USDT balance for a specific account' })
  getAccountUSDTBalance(@Param('accountId') accountId: string): USDTBalance {
    return this.balanceService.getAccountUSDTBalance(accountId);
  }
}
