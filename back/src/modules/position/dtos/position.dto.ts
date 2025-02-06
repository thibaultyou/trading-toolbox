import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber } from 'class-validator';

import { OrderSide } from '@order/types/order-side.enum';
import { TPSLMode } from '@order/types/tpsl-mode.enum';

import { IPosition } from '../types/position.interface';

export class PositionDto implements IPosition {
  @ApiProperty({
    description: 'Market identifier for the traded symbol',
    example: 'XRPUSDT'
  })
  @IsString()
  marketId: string;

  @ApiProperty({
    description: 'Side of the position (buy or sell)',
    example: OrderSide.BUY,
    enum: OrderSide
  })
  @IsEnum(OrderSide)
  side: OrderSide;

  @ApiProperty({
    description: 'Average price at which the position was entered',
    example: 0.61372149,
    type: Number
  })
  @IsNumber()
  avgPrice: number;

  @ApiProperty({
    description: 'Total value of the position',
    example: 74.2603,
    type: Number
  })
  @IsNumber()
  positionValue: number;

  @ApiProperty({
    description: 'Leverage applied to the position',
    example: 25,
    type: Number
  })
  @IsNumber()
  leverage: number;

  @ApiProperty({
    description: 'Unrealized profit or loss of the position',
    example: -3.4632,
    type: Number
  })
  @IsNumber()
  unrealisedPnl: number;

  @ApiProperty({
    description: 'Current market price of the underlying asset',
    example: 0.5851,
    type: Number
  })
  @IsNumber()
  markPrice: number;

  @ApiProperty({
    description: 'Amount of the asset in the position',
    example: 121,
    type: Number
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Stop loss mode used on the position',
    example: TPSLMode.PARTIAL,
    enum: TPSLMode
  })
  @IsEnum(TPSLMode)
  tpslMode: TPSLMode;

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

  constructor(position: IPosition) {
    Object.assign(this, position);
  }
}
