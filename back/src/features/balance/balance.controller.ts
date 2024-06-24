import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { BalanceService } from './balance.service';
import { BalanceReadResponseDto } from './dto/balance-read.response.dto';

@ApiTags('Balances')
@Controller('balances')
export class BalanceController extends BaseController {
  constructor(private readonly balanceService: BalanceService) {
    super('Balances');
  }

  @Get('/accounts/:accountId/balances')
  @ApiOperation({ summary: 'Fetch balances' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  getAccountBalances(@Param('accountId') accountId: string): BalanceReadResponseDto {
    return new BalanceReadResponseDto(this.balanceService.getBalances(accountId));
  }
}
