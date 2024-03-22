import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Market } from 'ccxt';

import { BaseController } from '../../common/base/base.controller';
import { MarketService } from './market.service';

@ApiTags('Markets')
@Controller('markets')
export class MarketController extends BaseController {
  constructor(private readonly marketService: MarketService) {
    super('Markets');
  }

  @Get('/:accountId/all')
  @ApiOperation({ summary: 'Fetch all market IDs for a specific account' })
  async fetchAllMarketIds(@Param('accountId') accountId: string): Promise<string[]> {
    return await this.marketService.fetchAllMarketIds(accountId);
  }

  @Get('/:accountId/spot')
  @ApiOperation({
    summary:
      'Fetch all spot market IDs for a specific account, optionally filtered by quote currency',
  })
  @ApiQuery({ name: 'quoteCurrency', required: false, example: 'USDT' })
  async fetchSpotMarketIds(
    @Param('accountId') accountId: string,
    @Query('quoteCurrency') quoteCurrency: string = 'USDT',
  ): Promise<string[]> {
    return await this.marketService.fetchSpotMarketIds(accountId, quoteCurrency);
  }

  @Get('/:accountId/contract')
  @ApiOperation({
    summary:
      'Fetch all contract market IDs for a specific account, optionally filtered by quote currency',
  })
  @ApiQuery({ name: 'quoteCurrency', required: false, example: 'USDT' })
  async fetchContractMarketIds(
    @Param('accountId') accountId: string,
    @Query('quoteCurrency') quoteCurrency: string = 'USDT',
  ): Promise<string[]> {
    return await this.marketService.fetchContractMarketIds(
      accountId,
      quoteCurrency,
    );
  }

  @Get('/:accountId/market/:marketId')
  @ApiOperation({
    summary: 'Fetch a specific market by market ID for an account',
  })
  async findMarketById(
    @Param('accountId') accountId: string,
    @Param('marketId') marketId: string,
  ): Promise<Market> {
    return await this.marketService.findMarketById(accountId, marketId);
  }
}
