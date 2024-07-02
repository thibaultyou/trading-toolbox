import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { API_BEARER_AUTH_NAME } from '../auth/auth.constants';
import { ValidateAccount } from '../auth/decorators/account-auth.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MarketReadResponseDto } from './dtos/market-read.response.dto';
import { MarketService } from './market.service';

@ApiTags('Markets')
@ApiBearerAuth(API_BEARER_AUTH_NAME)
@Controller('markets')
@UseGuards(JwtAuthGuard)
export class MarketController extends BaseController {
  constructor(private readonly marketService: MarketService) {
    super('Markets');
  }

  @Get('/accounts/:accountId')
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
    @ValidateAccount() accountId: string,
    @Query('quoteCurrency') quoteCurrency: string = 'USDT'
  ): string[] {
    return this.marketService.findAccountContractMarketIds(accountId, quoteCurrency);
  }

  @Get('/accounts/:accountId/market/:marketId')
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
  findAccountMarketById(
    @ValidateAccount() accountId: string,
    @Param('marketId') marketId: string
  ): MarketReadResponseDto {
    return new MarketReadResponseDto(this.marketService.findAccountContractMarketById(accountId, marketId));
  }
}
