import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';

import { BalanceService } from './balance.service';

@ApiTags('balances')
@Controller('balances')
export class BalanceController extends BaseController {
  constructor(private readonly balanceService: BalanceService) {
    super('Balances');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all balances' })
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
