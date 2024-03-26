import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Order, Position } from 'ccxt';

import { BaseController } from '../../common/base/base.controller';
import { PositionService } from './position.service';

@ApiTags('Positions')
@Controller('positions')
export class PositionController extends BaseController {
  constructor(private readonly positionService: PositionService) {
    super('Positions');
  }

  @Get('/:accountId')
  @ApiOperation({ summary: 'Fetch positions for a specific account' })
  getAccountPositions(@Param('accountId') accountId: string): Position[] {
    return this.positionService.getAccountPositions(accountId);
  }

  @Delete('/:accountId/:positionId')
  @ApiOperation({ summary: 'Close a specific position for a specific account' })
  async closePositionById(
    @Param('accountId') accountId: string,
    @Param('positionId') positionId: string
  ): Promise<Order> {
    return this.positionService.closePositionById(accountId, positionId);
  }
}
