import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { TickerService } from './ticker.service';

@ApiTags('Tickers')
@Controller('tickers')
export class TickerController extends BaseController {
  constructor(private readonly tickerService: TickerService) {
    super('TickerController');
  }

  // @Get('/:accountId/:base/price')
  // @ApiOperation({ summary: 'Get subscribed ticker price' })
  // async getTickerPrice(
  //   @Param('accountId') accountId: string,
  //   @Param('base') base: string,
  // ): Promise<number> {
  //   try {
  //     const price = this.tickerService.getTickerPrice(accountId, base);

  //     if (price === undefined) {
  //       throw new TickerPriceNotFoundException(accountId, base);
  //     }

  //     return price;
  //   } catch (error) {
  //     throw new GetTickerPriceException(accountId, base, error);
  //   }
  // }

  // @Post('/:accountId/:base/subscribe')
  // @ApiOperation({ summary: 'Subscribe to a ticker price' })
  // async subscribeTicker(
  //   @Param('accountId') accountId: string,
  //   @Param('base') base: string,
  // ): Promise<string> {
  //   try {
  //     this.tickerService.subscribeToTickerPrice(accountId, base);

  //     return `Subscribed to ticker ${base} price for account ${accountId}`;
  //   } catch (error) {
  //     throw new SubscribeToTickerPriceException(base, error);
  //   }
  // }

  // @Delete('/:accountId/:base/unsubscribe')
  // @ApiOperation({ summary: 'Unsubscribe from a ticker price' })
  // async unsubscribeTicker(
  //   @Param('accountId') accountId: string,
  //   @Param('base') base: string,
  // ): Promise<string> {
  //   try {
  //     this.tickerService.unsubscribeFromTickerPrice(accountId, base);

  //     return `Unsubscribed from ticker ${base} price for account ${accountId}`;
  //   } catch (error) {
  //     throw new UnsubscribeFromTickerPriceException(base, error);
  //   }
  // }

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
