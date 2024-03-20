import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';

import {
  FetchTickerPriceHistoryException,
  GetTickerPriceException,
  SubscribeToTickerPriceException,
  TickerPriceNotFoundException,
  UnsubscribeFromTickerPriceException,
} from './exceptions/ticker.exceptions';
import { TickerService } from './ticker.service';
import { Candle } from './ticker.types';

@Controller('tickers')
@ApiTags('tickers')
export class TickerController extends BaseController {
  constructor(private readonly tickerService: TickerService) {
    super('TickerController');
  }

  @Get('/:accountName/:base/price')
  @ApiOperation({ summary: 'Get subscribed ticker price' })
  async getTickerPrice(
    @Param('accountName') accountName: string,
    @Param('base') base: string,
  ): Promise<number> {
    try {
      const price = this.tickerService.getTickerPrice(accountName, base);
      if (price === undefined) {
        throw new TickerPriceNotFoundException(accountName, base);
      }
      return price;
    } catch (error) {
      throw new GetTickerPriceException(accountName, base, error);
    }
  }

  @Post('/:accountName/:base/subscribe')
  @ApiOperation({ summary: 'Subscribe to a ticker price' })
  async subscribeTicker(
    @Param('accountName') accountName: string,
    @Param('base') base: string,
  ): Promise<string> {
    try {
      this.tickerService.subscribeToTickerPrice(accountName, base);
      return `Subscribed to ticker ${base} price for account ${accountName}`;
    } catch (error) {
      throw new SubscribeToTickerPriceException(base, error);
    }
  }

  @Delete('/:accountName/:base/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from a ticker price' })
  async unsubscribeTicker(
    @Param('accountName') accountName: string,
    @Param('base') base: string,
  ): Promise<string> {
    try {
      this.tickerService.unsubscribeFromTickerPrice(accountName, base);
      return `Unsubscribed from ticker ${base} price for account ${accountName}`;
    } catch (error) {
      throw new UnsubscribeFromTickerPriceException(base, error);
    }
  }

  @Get('/:base/history')
  @ApiOperation({ summary: 'Get ticker price history' })
  async getHistory(
    @Param('base') base: string,
    @Query('newOnly') newOnly: boolean,
  ): Promise<Candle[]> {
    try {
      return await this.tickerService.getTickerPriceHistory(base, newOnly);
    } catch (error) {
      throw new FetchTickerPriceHistoryException(base, newOnly, error);
    }
  }
}
