import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { GetTickerPriceException, TickerPriceNotFoundException } from './exceptions/ticker.exceptions';
import { TickerService } from './ticker.service';

@ApiTags('Tickers')
@Controller('tickers')
export class TickerController extends BaseController {
  constructor(private readonly tickerService: TickerService) {
    super('TickerController');
  }

  @Get('/:accountId/:marketId/price')
  @ApiOperation({ summary: 'Get ticker price' })
  async getTickerPrice(@Param('accountId') accountId: string, @Param('marketId') marketId: string): Promise<number> {
    try {
      const price = this.tickerService.getTickerPrice(accountId, marketId);

      if (price === undefined) {
        throw new TickerPriceNotFoundException(accountId, marketId);
      }

      return price;
    } catch (error) {
      throw new GetTickerPriceException(accountId, marketId, error);
    }
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
