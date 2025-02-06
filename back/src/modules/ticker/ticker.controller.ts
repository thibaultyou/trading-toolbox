import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AccountValidationGuard } from '@account/guards/account-validation.guard';
import { BaseController } from '@common/base.controller';
import { ValidateAccount } from '@common/decorators/account-validation.decorator';
import { Urls } from '@config';
import { JwtAuthGuard } from '@user/guards/jwt-auth.guard';

import { TickerService } from './ticker.service';

@ApiTags('Tickers')
@UseGuards(JwtAuthGuard, AccountValidationGuard)
@ApiBearerAuth()
@Controller(Urls.TICKERS)
export class TickerController extends BaseController {
  constructor(private readonly tickerService: TickerService) {
    super('TickerController');
  }

  @Get('/accounts/:accountId/markets/:marketId')
  @ValidateAccount()
  @ApiOperation({ summary: 'Get ticker price' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({
    name: 'marketId',
    required: true,
    description: 'The trading symbol of the ticker (e.g., BTCUSDT)'
  })
  async getTickerPrice(@Param('accountId') accountId: string, @Param('marketId') marketId: string): Promise<number> {
    return await this.tickerService.getTickerPrice(accountId, marketId);
  }
}
