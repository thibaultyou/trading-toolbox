import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

import { IOrderDetails } from '../types/order-details.interface';
import { OrderSide } from '../types/order-side.enum';
import { OrderType } from '../types/order-type.enum';
import { TPSLMode } from '../types/tpsl-mode.enum';

export class OrderCreateRequestDto implements IOrderDetails {
  @ApiProperty({
    description: 'The market ID for the trading pair.',
    example: 'FTMUSDT'
  })
  @IsNotEmpty({ message: 'Market ID is required.' })
  @IsString({ message: 'Market ID must be a string.' })
  marketId: string;

  @ApiProperty({
    description: 'External order link ID, used for tracking the order on external systems or client side',
    example: '3cms_req_t_697716177_3'
  })
  @IsOptional()
  @IsString({ message: 'Order link ID must be a string.' })
  linkId?: string;

  @ApiProperty({
    description: 'Type of order, like limit or market',
    enum: OrderType,
    example: OrderType.LIMIT
  })
  @IsNotEmpty({ message: 'Order type is required.' })
  @IsEnum(OrderType, { message: 'Invalid order type.' })
  type: OrderType;

  @ApiProperty({
    description: 'The order side (buy or sell).',
    enum: OrderSide,
    example: OrderSide.BUY
  })
  @IsNotEmpty({ message: 'Order side is required.' })
  @IsEnum(OrderSide, { message: 'Invalid order side.' })
  side: OrderSide;

  @ApiProperty({
    description: 'The quantity of the order.',
    example: 1.5,
    type: 'number'
  })
  @IsNotEmpty({ message: 'Quantity is required.' })
  @IsNumber({}, { message: 'Quantity must be a number.' })
  @IsPositive({ message: 'Quantity must be positive.' })
  quantity: number;

  @ApiProperty({
    description: 'The limit price for the order, optional.',
    example: 10000,
    type: 'number',
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number if specified.' })
  @IsPositive({ message: 'Price must be positive if specified.' })
  price?: number;

  @ApiProperty({
    description: 'The stop loss price, optional.',
    example: 9500,
    type: 'number',
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stop loss price must be a number if specified.' })
  @IsPositive({ message: 'Stop loss price must be positive if specified.' })
  stopLossPrice?: number;

  @ApiProperty({
    description: 'The take profit price, optional.',
    example: 10500,
    type: 'number',
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Take profit price must be a number if specified.' })
  @IsPositive({ message: 'Take profit price must be positive if specified.' })
  takeProfitPrice?: number;

  @ApiProperty({
    description: 'Mode for Take Profit and Stop Loss',
    example: TPSLMode.PARTIAL,
    enum: TPSLMode,
    default: TPSLMode.PARTIAL,
    required: false
  })
  @IsOptional()
  @IsEnum(TPSLMode)
  @IsEnum(TPSLMode, { message: 'Invalid take profit / stop loss mode.' })
  tpslMode?: TPSLMode = TPSLMode.PARTIAL;

  @ApiProperty({
    description: 'The additional parameters for the order, optional.',
    example: { something: 'test' },
    type: 'object',
    required: false
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Params must be a non-empty object if specified.' })
  params?: Record<string, any> = {};
}
