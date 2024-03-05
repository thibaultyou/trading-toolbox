import {
  Controller,
  Get
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../common/base.controller';

import { BalanceService } from './balance.service';

@ApiTags('balances')
@Controller('balances')
export class BalanceController extends BaseController {
  constructor(private readonly balanceService: BalanceService) {
    super('Balances');
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all Balances' })
  findAll(): Record<string, number> {
    return this.balanceService.getBalances();
  }
}
