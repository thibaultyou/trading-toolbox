import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { AccountService } from '../account/account.service';
import { ExchangeService } from '../exchange/exchange.service';

import { MarketListResponseDto } from './dto/market-list.response.dto';
import { MarketResponseDto } from './dto/market.response.dto';
import { MarketNotFoundException } from './exceptions/market.exceptions';

@ApiTags('markets')
@Controller('markets')
export class MarketController extends BaseController {
  constructor(
    private readonly accountService: AccountService,
    private readonly exchangeService: ExchangeService,
  ) {
    super('Markets');
  }

  @Get('/:accountName/available-usdt-markets')
  @ApiOperation({ summary: 'List all available USDT markets per account' })
  async listAvailableUsdtMarkets(
    @Param('accountName') accountName: string,
  ): Promise<MarketListResponseDto> {
    const account = await this.accountService.findOneByName(accountName);
    const markets = await this.exchangeService.getUsdtMarkets(account.name);
    const marketDtos = markets.map((market) => new MarketResponseDto(market));
    return new MarketListResponseDto(account.name, marketDtos);
  }

  @Get('/:accountName/available-usdt-markets/:baseCurrency')
  @ApiOperation({
    summary: 'Get a specific USDT market by account and baseCurrency',
  })
  async getSpecificUsdtMarket(
    @Param('accountName') accountName: string,
    @Param('baseCurrency') baseCurrency: string,
  ): Promise<MarketResponseDto> {
    const market = await this.exchangeService.getSpecificUsdtMarket(
      accountName,
      baseCurrency,
    );
    if (!market) {
      throw new MarketNotFoundException(accountName, baseCurrency);
    }
    return new MarketResponseDto(market);
  }
}
