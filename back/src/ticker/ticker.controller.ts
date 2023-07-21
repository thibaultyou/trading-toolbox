import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { AccountService } from '../account/account.service'; // Assuming you have AccountService
import { BaseController } from '../common/base.controller';
import { ExchangeService } from '../exchange/exchange.service';

import {
  FetchAllTickersException,
  FetchTickerHistoryException,
} from './exceptions/ticker.exceptions';
import { TickerService } from './ticker.service';
import { Candle } from './ticker.types';

@Controller('tickers')
@ApiTags('tickers')
export class TickerController extends BaseController {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly tickerService: TickerService,
    private readonly accountService: AccountService, // Inject AccountService
  ) {
    super('TickerController');
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickers' })
  async findAll(): Promise<string[]> {
    try {
      const accounts = await this.accountService.findAll();
      const tickersPromises = accounts.map((account) =>
        this.exchangeService.getTickers(account.name),
      );
      const tickers = await Promise.all(tickersPromises);

      return tickers.flat();
    } catch (error) {
      throw new FetchAllTickersException(error);
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
