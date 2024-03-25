import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Market } from 'ccxt';

import { BaseController } from '../common/base/base.controller';
import { MarketService } from './market.service';

@ApiTags('Markets')
@Controller('markets')
export class MarketController extends BaseController {
  constructor(private readonly marketService: MarketService) {
    super('Markets');
  }

  @Get('/:accountId/all')
  @ApiOperation({ summary: 'Fetch all market IDs for a specific account' })
  findAccountMarketIds(@Param('accountId') accountId: string): string[] {
    return this.marketService.findAccountMarketIds(accountId);
  }

  @Get('/:accountId/spot')
  @ApiOperation({
    summary: 'Fetch all spot market IDs for a specific account, optionally filtered by quote currency'
  })
  @ApiQuery({ name: 'quoteCurrency', required: false, example: 'USDT' })
  findAccountSpotMarketIds(
    @Param('accountId') accountId: string,
    @Query('quoteCurrency') quoteCurrency: string = 'USDT'
  ): string[] {
    return this.marketService.findAccountSpotMarketIds(accountId, quoteCurrency);
  }

  @Get('/:accountId/contract')
  @ApiOperation({
    summary: 'Fetch all contract market IDs for a specific account, optionally filtered by quote currency'
  })
  @ApiQuery({ name: 'quoteCurrency', required: false, example: 'USDT' })
  findAccountContractMarketIds(
    @Param('accountId') accountId: string,
    @Query('quoteCurrency') quoteCurrency: string = 'USDT'
  ): string[] {
    return this.marketService.findAccountContractMarketIds(accountId, quoteCurrency);
  }

  @Get('/:accountId/market/:marketId')
  @ApiOperation({
    summary: 'Fetch a specific market by market ID for an account'
  })
  findAccountMarketById(@Param('accountId') accountId: string, @Param('marketId') marketId: string): Market {
    return this.marketService.findAccountMarketById(accountId, marketId);
  }
}
