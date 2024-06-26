import { ApiProperty } from '@nestjs/swagger';

import { IOrderDetails } from '../../../order/types/order-details.interface';
import { OrderSide } from '../../../order/types/order-side.enum';
import { OrderType } from '../../../order/types/order-type.enum';

export class OrderDetailsDto implements IOrderDetails {
  @ApiProperty({
    description: 'Market ID associated with the position',
    example: 'BTCUSDT'
  })
  marketId: string;

  @ApiProperty({
    description: 'Type of order, like limit or market',
    enum: OrderType,
    example: OrderType.LIMIT
  })
  type: OrderType;

  @ApiProperty({
    description: 'Side of the order, either buy or sell',
    enum: OrderSide,
    example: OrderSide.BUY
  })
  side: OrderSide;

  @ApiProperty({
    description: 'Quantity involved in the order',
    example: 100
  })
  quantity: number;

  @ApiProperty({
    description: 'Price of the order, if applicable',
    example: 3000,
    required: false
  })
  price?: number;

  @ApiProperty({
    description: 'The stop loss price, optional.',
    example: 9500,
    type: 'number',
    required: false
  })
  stopLossPrice?: number;

  @ApiProperty({
    description: 'The take profit price, optional.',
    example: 10500,
    type: 'number',
    required: false
  })
  takeProfitPrice?: number;
}
