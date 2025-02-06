import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AccountValidationGuard } from '@account/guards/account-validation.guard';
import { BaseController } from '@common/base.controller';
import { ValidateAccount } from '@common/decorators/account-validation.decorator';
import { Urls } from '@config';
import { OrderDto } from '@order/dtos/order.dto';
import { OrderMapperService } from '@order/services/order-mapper.service';
import { OrderSide } from '@order/types/order-side.enum';
import { JwtAuthGuard } from '@user/guards/jwt-auth.guard';

import { PositionDto } from './dtos/position.dto';
import { PositionService } from './position.service';
import { PositionMapperService } from './services/position-mapper.service';

@ApiTags('Positions')
@UseGuards(JwtAuthGuard, AccountValidationGuard)
@ApiBearerAuth()
@Controller(Urls.POSITIONS)
export class PositionController extends BaseController {
  constructor(
    private readonly positionService: PositionService,
    private readonly positionMapper: PositionMapperService,
    private readonly orderMapper: OrderMapperService
  ) {
    super('Positions');
  }

  @Get('/accounts/:accountId/positions')
  @ValidateAccount()
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
  ): PositionDto[] {
    const positions = this.positionService.getPositions(accountId, symbol, side);
    return positions.map((p) => this.positionMapper.toDto(p));
  }

  @Delete('/accounts/:accountId/markets/:marketId/positions/:side')
  @ValidateAccount()
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
  ): Promise<OrderDto> {
    const order = await this.positionService.closePosition(accountId, marketId, side);
    return this.orderMapper.fromExternal(order);
  }
}
