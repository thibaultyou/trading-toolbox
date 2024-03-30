import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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
  getTickerPrice(@Param('accountId') accountId: string, @Param('marketId') marketId: string): number {
    return this.tickerService.getTickerPrice(accountId, marketId);
  }

  // @Get('/:base/history')
  // @ApiOperation({ summary: 'Get ticker price history' })
  // async getHistory(
  //   @Param('base') base: string,
  //   @Query('newOnly') newOnly: boolean,
  // ): Promise<Candle[]> {
  //   try {
  //     return await this.tickerService.getTickerPriceHistory(base, newOnly);
  //   } catch (error) {
  //     throw new FetchTickerPriceHistoryException(base, newOnly, error);
  //   }
  // }
}
