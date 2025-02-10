import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AccountValidationGuard } from '@account/guards/account-validation.guard';
import { BaseController } from '@common/base.controller';
import { ValidateAccount } from '@common/decorators/account-validation.decorator';
import { Urls } from '@config';
import { JwtAuthGuard } from '@user/guards/jwt-auth.guard';

import { MarketDto } from './dtos/market.dto';
import { MarketService } from './market.service';

@ApiTags('Markets')
@UseGuards(JwtAuthGuard, AccountValidationGuard)
@ApiBearerAuth()
@Controller(Urls.MARKETS)
export class MarketController extends BaseController {
  constructor(private readonly marketService: MarketService) {
    super('Markets');
  }

  @Get('/accounts/:accountId')
  @ValidateAccount()
  @ApiOperation({
    summary: 'Fetch all contract market IDs'
  })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiQuery({
    name: 'quoteCurrency',
    required: false,
    example: 'USDT',
    description:
      "Filters contract markets by the quote currency (e.g., 'USDT', 'BTC'). If unspecified, defaults to 'USDT'."
  })
  findAccountContractMarketIds(
    @Param('accountId') accountId: string,
    @Query('quoteCurrency') quoteCurrency: string = 'USDT'
  ): string[] {
    return this.marketService.findAccountContractMarketIds(accountId, quoteCurrency);
  }

  @Get('/accounts/:accountId/market/:marketId')
  @ValidateAccount()
  @ApiOperation({
    summary: 'Fetch a single contract market'
  })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({
    name: 'marketId',
    required: true,
    description: 'The market ID of the contract market',
    example: 'BTCUSDT'
  })
  findAccountMarketById(@Param('accountId') accountId: string, @Param('marketId') marketId: string): MarketDto {
    return new MarketDto(this.marketService.findAccountContractMarketById(accountId, marketId));
  }
}
