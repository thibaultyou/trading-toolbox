import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Fetch open positions' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  getAccountPositions(@Param('accountId') accountId: string): PositionReadResponseDto[] {
    return this.positionService.getAccountOpenPositions(accountId).map((p) => new PositionReadResponseDto(p));
  }

  @Delete('/:accountId/:symbol/:side')
  @ApiOperation({ summary: 'Close a position' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({
    name: 'marketId',
    required: true,
    description: 'The trading symbol of the position to close (e.g., BTCUSDT)'
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
