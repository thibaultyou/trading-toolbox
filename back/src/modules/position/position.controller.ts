import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ValidateAccount } from '@account/decorators/account-validation.decorator';
import { AccountValidationGuard } from '@account/guards/account-validation.guard';
import { BaseController } from '@common/base.controller';
import { OrderReadResponseDto } from '@order/dtos/order-read.response.dto';
import { OrderSide } from '@order/types/order-side.enum';
import { JwtAuthGuard } from '@user/guards/jwt-auth.guard';

import { PositionReadResponseDto } from './dtos/position-read.response.dto';
import { PositionService } from './position.service';

@ApiTags('Positions')
@UseGuards(JwtAuthGuard, AccountValidationGuard)
@ApiBearerAuth()
@Controller('positions')
export class PositionController extends BaseController {
  constructor(private readonly positionService: PositionService) {
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
  ): PositionReadResponseDto[] {
    return this.positionService.getPositions(accountId, symbol, side).map((p) => new PositionReadResponseDto(p));
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
  ): Promise<OrderReadResponseDto> {
    return new OrderReadResponseDto(await this.positionService.closePosition(accountId, marketId, side));
  }
}
