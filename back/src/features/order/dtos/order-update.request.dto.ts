import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class OrderUpdateRequestDto {
  @ApiProperty({
    description: 'The quantity of the order.',
    example: 1.5,
    type: 'number'
  })
  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number.' })
  @IsPositive({ message: 'Quantity must be positive.' })
  quantity?: number;

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
    description: 'The take profit price for the order, optional.',
    example: 11000,
    type: 'number',
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Take profit price must be a number if specified.' })
  @IsPositive({ message: 'Take profit price must be positive if specified.' })
  takeProfitPrice?: number;

  @ApiProperty({
    description: 'The stop loss price for the order, optional.',
    example: 9000,
    type: 'number',
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: 'Stop loss price must be a number if specified.' })
  @IsPositive({ message: 'Stop loss price must be positive if specified.' })
  stopLossPrice?: number;

  // @ApiProperty({
  //   description: 'Mode for Take Profit and Stop Loss',
  //   example: TPSLMode.PARTIAL,
  //   enum: TPSLMode,
  //   default: TPSLMode.PARTIAL,
  //   required: false
  // })
  // @IsOptional()
  // @IsEnum(TPSLMode)
  // @IsEnum(TPSLMode, { message: 'Invalid take profit / stop loss mode.' })
  // tpslMode?: TPSLMode;
}
