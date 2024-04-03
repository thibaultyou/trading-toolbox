import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

import { OrderSide } from '../order.types';

export class OrderCreateRequestDto {
  @ApiProperty({
    description: 'The market ID for the trading pair.',
    example: 'FTMUSDT'
  })
  @IsNotEmpty({ message: 'Market ID is required.' })
  @IsString({ message: 'Market ID must be a string.' })
  marketId: string;

  @ApiProperty({
    description: 'The order side (BUY or SELL).',
    enum: OrderSide,
    example: OrderSide.Buy
  })
  @IsNotEmpty({ message: 'Order side is required.' })
  @IsEnum(OrderSide, { message: 'Invalid order side.' })
  side: OrderSide;

  @ApiProperty({
    description: 'The volume of the order.',
    example: 1.5,
    type: 'number'
  })
  @IsNotEmpty({ message: 'Volume is required.' })
  @IsNumber({}, { message: 'Volume must be a number.' })
  @IsPositive({ message: 'Volume must be positive.' })
  volume: number;

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
}
