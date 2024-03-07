import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../common/base.controller';

import { BalanceService } from './balance.service';
import { FetchAccountBalanceException } from './exceptions/balance.exceptions';

@ApiTags('balances')
@Controller('balances')
export class BalanceController extends BaseController {
  private readonly logger = new Logger(BalanceController.name);

  constructor(private readonly balanceService: BalanceService) {
    super('Balances');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all Balances' })
  findAll(): Record<string, number> {
    return this.balanceService.getBalances();
  }

  @Get('/:accountName')
  @ApiOperation({ summary: 'Fetch balance for a specific account' })
  async findAccountBalance(
    @Param('accountName') accountName: string,
  ): Promise<number> {
    return await this.balanceService.getOrRefreshAccountBalance(accountName);
  }
}
