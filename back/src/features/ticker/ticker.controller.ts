import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { TickerService } from './ticker.service';

@ApiTags('Tickers')
@Controller('tickers')
export class TickerController extends BaseController {
  constructor(private readonly tickerService: TickerService) {
    super('TickerController');
  }

  @Get('/:accountId/:marketId/price')
  @ApiOperation({ summary: 'Get ticker price' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({
    name: 'marketId',
    required: true,
    description: 'The trading symbol of the ticker (e.g., BTCUSDT)'
  })
  getTickerPrice(@Param('accountId') accountId: string, @Param('marketId') marketId: string): number {
    return this.tickerService.getTickerPrice(accountId, marketId);
  }
}
