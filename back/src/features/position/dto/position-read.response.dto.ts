import { ApiProperty } from '@nestjs/swagger';
import { Position } from 'ccxt';

import { OrderSide } from '../../order/order.types';

export class PositionReadResponseDto {
  // FIXME where's my id ?

  @ApiProperty({
    description: 'Market identifier for the traded symbol',
    example: 'XRPUSDT'
  })
  marketId: string;

  @ApiProperty({
    description: 'Side of the position (buy or sell)',
    example: OrderSide.Buy,
    enum: OrderSide
  })
  side: OrderSide;

  @ApiProperty({
    description: 'Average price at which the position was entered',
    example: 0.61372149,
    type: Number
  })
  avgPrice: number;

  @ApiProperty({
    description: 'Total value of the position',
    example: 74.2603,
    type: Number
  })
  positionValue: number;

  @ApiProperty({
    description: 'Leverage applied to the position',
    example: 25,
    type: Number
  })
  leverage: number;

  @ApiProperty({
    description: 'Unrealized profit or loss of the position',
    example: -3.4632,
    type: Number
  })
  unrealisedPnl: number;

  @ApiProperty({
    description: 'Current market price of the underlying asset',
    example: 0.5851,
    type: Number
  })
  markPrice: number;

  @ApiProperty({
    description: 'Amount of the asset in the position',
    example: 121,
    type: Number
  })
  amount: number;

  @ApiProperty({
    description: 'Price at which the position will automatically close in profit',
    example: 0,
    type: Number
  })
  takeProfitPrice: number;

  @ApiProperty({
    description: 'Price at which the position will automatically close at a loss to prevent further losses',
    example: 0,
    type: Number
  })
  stopLossPrice: number;

  @ApiProperty({
    description: 'Timestamp when the position was created',
    example: 1678071047066,
    type: Number
  })
  createdTime: number;

  @ApiProperty({
    description: 'Timestamp when the position was last updated',
    example: 1712131200564,
    type: Number
  })
  updatedTime: number;

  constructor(position: Position) {
    this.marketId = position.info.symbol;
    this.side = position.info.side.toLowerCase() === 'buy' ? OrderSide.Buy : OrderSide.Sell;
    this.avgPrice = parseFloat(position.info.avgPrice);
    this.positionValue = parseFloat(position.info.positionValue);
    this.leverage = parseFloat(position.info.leverage);
    this.unrealisedPnl = parseFloat(position.info.unrealisedPnl);
    this.markPrice = parseFloat(position.info.markPrice);
    this.amount = parseFloat(position.info.size);
    this.takeProfitPrice = position.takeProfitPrice;
    this.stopLossPrice = position.stopLossPrice;
    this.createdTime = parseInt(position.info.createdTime);
    this.updatedTime = parseInt(position.info.updatedTime);
  }
}
