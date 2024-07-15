import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { API_BEARER_AUTH_NAME } from '@auth/auth.constants';
import { ValidateAccount } from '@auth/decorators/account-auth.decorator';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { BaseController } from '@common/base/base.controller';

import { TickerService } from './ticker.service';

@ApiTags('Tickers')
@ApiBearerAuth(API_BEARER_AUTH_NAME)
@Controller('tickers')
@UseGuards(JwtAuthGuard)
export class TickerController extends BaseController {
  constructor(private readonly tickerService: TickerService) {
    super('TickerController');
  }

  @Get('/accounts/:accountId/markets/:marketId')
  @ApiOperation({ summary: 'Get ticker price' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({
    name: 'marketId',
    required: true,
    description: 'The trading symbol of the ticker (e.g., BTCUSDT)'
  })
  async getTickerPrice(@ValidateAccount() accountId: string, @Param('marketId') marketId: string): Promise<number> {
    return await this.tickerService.getTickerPrice(accountId, marketId);
  }
}
