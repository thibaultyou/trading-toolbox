import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { OrderReadResponseDto } from '../order/dto/order-read.response.dto';
import { OrderSide } from '../order/order.types';
import { PositionReadResponseDto } from './dto/position-read.response.dto';
import { PositionService } from './position.service';

@ApiTags('Positions')
@Controller('positions')
export class PositionController extends BaseController {
  constructor(private readonly positionService: PositionService) {
    super('Positions');
  }

  @Get('/:accountId')
  @ApiOperation({ summary: 'Fetch open positions for a specific account, optionally filtered by symbol and/or side' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiQuery({
    name: 'symbol',
    required: false,
    description: 'Optional trading symbol to filter positions (e.g., BTCUSDT)'
  })
  @ApiQuery({ name: 'side', required: false, description: 'Optional side to filter positions (e.g., buy or sell)' })
  getAccountOpenPositions(
    @Param('accountId') accountId: string,
    @Query('symbol') symbol?: string,
    @Query('side') side?: OrderSide
  ): PositionReadResponseDto[] {
    return this.positionService
      .getAccountOpenPositions(accountId, symbol, side)
      .map((p) => new PositionReadResponseDto(p));
  }

  @Delete('/:accountId/:marketId/:side')
  @ApiOperation({ summary: 'Close a position' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({
    name: 'marketId',
    required: true,
    description: 'The ID of the market symbol to filter orders (e.g., BTCUSDT)'
  })
  @ApiParam({ name: 'side', required: true, description: 'The side of the position to close (e.g., buy or sell)' })
  async closePosition(
    @Param('accountId') accountId: string,
    @Param('marketId') marketId: string,
    @Param('side') side: OrderSide
  ): Promise<OrderReadResponseDto> {
    return new OrderReadResponseDto(await this.positionService.closePosition(accountId, marketId, side));
  }
}
