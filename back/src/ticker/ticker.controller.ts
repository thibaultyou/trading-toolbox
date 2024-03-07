import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BaseController } from '../common/base.controller';

import {
  FetchTickerHistoryException,
  GetTickerPriceException,
  SubscribeTickerException,
  UnsubscribeTickerException,
} from './exceptions/ticker.exceptions';
import { TickerService } from './ticker.service';
import { Candle } from './ticker.types';

@Controller('tickers')
@ApiTags('tickers')
export class TickerController extends BaseController {
  constructor(private readonly tickerService: TickerService) {
    super('TickerController');
  }

  @Get('/:accountName/:symbol/price')
  @ApiOperation({ summary: 'Get subscribed ticker price' })
  async getTickerPrice(
    @Param('accountName') accountName: string,
    @Param('symbol') symbol: string,
  ): Promise<number> {
    try {
      const price = this.tickerService.getTicker(accountName, symbol);
      if (price === undefined) {
        throw new GetTickerPriceException(
          accountName,
          symbol,
          'Ticker not found',
        );
      }
      return price;
    } catch (error) {
      throw new GetTickerPriceException(accountName, symbol, error);
    }
  }

  @Post('/:accountName/:symbol/subscribe')
  @ApiOperation({ summary: 'Subscribe to a ticker' })
  async subscribeTicker(
    @Param('accountName') accountName: string,
    @Param('symbol') symbol: string,
  ): Promise<string> {
    try {
      this.tickerService.subscribeTicker(accountName, symbol);
      return `Subscribed to ticker ${symbol} for account ${accountName}`;
    } catch (error) {
      throw new SubscribeTickerException(symbol, error);
    }
  }

  @Delete('/:accountName/:symbol/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from a ticker' })
  async unsubscribeTicker(
    @Param('accountName') accountName: string,
    @Param('symbol') symbol: string,
  ): Promise<string> {
    try {
      this.tickerService.unsubscribeTicker(accountName, symbol);
      return `Unsubscribed from ticker ${symbol} for account ${accountName}`;
    } catch (error) {
      throw new UnsubscribeTickerException(symbol, error);
    }
  }

  @Get('/:symbol/history')
  @ApiOperation({ summary: 'Get ticker history' })
  async getHistory(
    @Param('symbol') symbol: string,
    @Query('newOnly') newOnly: boolean,
  ): Promise<Candle[]> {
    try {
      return await this.tickerService.getHistory(symbol, newOnly);
    } catch (error) {
      throw new FetchTickerHistoryException(symbol, newOnly, error);
    }
  }
}
