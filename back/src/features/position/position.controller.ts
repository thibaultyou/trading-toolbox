import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { API_BEARER_AUTH_NAME } from '../auth/auth.constants';
import { ValidateAccount } from '../auth/decorators/account-auth.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderReadResponseDto } from '../order/dtos/order-read.response.dto';
import { OrderSide } from '../order/types/order-side.enum';
import { PositionReadResponseDto } from './dtos/position-read.response.dto';
import { PositionService } from './position.service';

@ApiTags('Positions')
@ApiBearerAuth(API_BEARER_AUTH_NAME)
@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionController extends BaseController {
  constructor(private readonly positionService: PositionService) {
    super('Positions');
  }

  @Get('/accounts/:accountId/positions')
  @ApiOperation({ summary: 'Fetch open positions for a specific account, optionally filtered by symbol and/or side' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiQuery({
    name: 'symbol',
    required: false,
    description: 'Optional trading symbol to filter positions (e.g., BTCUSDT)'
  })
  @ApiQuery({ name: 'side', required: false, description: 'Optional side to filter positions (e.g., buy or sell)' })
  getAccountOpenPositions(
    @ValidateAccount() accountId: string,
    @Query('symbol') symbol?: string,
    @Query('side') side?: OrderSide
  ): PositionReadResponseDto[] {
    return this.positionService.getPositions(accountId, symbol, side).map((p) => new PositionReadResponseDto(p));
  }

  @Delete('/accounts/:accountId/markets/:marketId/positions/:side')
  @ApiOperation({ summary: 'Close a position' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({
    name: 'marketId',
    required: true,
    description: 'The ID of the market symbol to filter orders (e.g., BTCUSDT)'
  })
  @ApiParam({ name: 'side', required: true, description: 'The side of the position to close (e.g., buy or sell)' })
  async closePosition(
    @ValidateAccount() accountId: string,
    @Param('marketId') marketId: string,
    @Param('side') side: OrderSide
  ): Promise<OrderReadResponseDto> {
    return new OrderReadResponseDto(await this.positionService.closePosition(accountId, marketId, side));
  }
}
