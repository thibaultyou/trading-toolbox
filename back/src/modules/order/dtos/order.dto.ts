import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

import { OrderSide } from '../types/order-side.enum';
import { OrderType } from '../types/order-type.enum';
import { IOrder } from '../types/order.interface';
import { TPSLMode } from '../types/tpsl-mode.enum';

export class OrderDto implements IOrder {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: '3f309063-cfd1-4ce8-ad74-77c94b01563f'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'External order link ID, used for tracking the order on external systems or client side',
    example: '3cms_req_t_697716177_3'
  })
  @IsString()
  linkId: string;

  @ApiProperty({
    description: 'Trading symbol for the order',
    example: 'DOGEUSDT'
  })
  @IsString()
  marketId: string;

  @ApiProperty({
    description: 'Price per unit for the order',
    example: 0.22184,
    type: Number
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Amount of the asset to buy or sell',
    example: 33,
    type: Number
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Order side, indicating whether the order is a buy or sell',
    example: OrderSide.SELL,
    enum: OrderSide
  })
  @IsEnum(OrderSide)
  side: OrderSide;

  @ApiProperty({
    description: 'Current status of the order',
    example: 'canceled'
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Type of the order, e.g., limit or market',
    example: OrderType.LIMIT,
    enum: OrderType
  })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({
    description: 'Quantity of the order that has not been filled',
    example: 0,
    type: Number
  })
  @IsNumber()
  leavesQty: number;

  @ApiProperty({
    description: 'Mode for Take Profit and Stop Loss',
    example: TPSLMode.PARTIAL,
    enum: TPSLMode
  })
  @IsEnum(TPSLMode)
  tpslMode: TPSLMode;

  @ApiProperty({
    description: 'Price at which the order is triggered',
    example: 0.5,
    type: Number
  })
  @IsNumber()
  triggerPrice: number;

  @ApiProperty({
    description: 'Timestamp when the order was created',
    example: 1711934440046,
    type: Number
  })
  @IsNumber()
  createdTime: number;

  @ApiProperty({
    description: 'Timestamp when the order was last updated',
    example: 1711950591199,
    type: Number
  })
  @IsNumber()
  updatedTime: number;

  constructor(order: IOrder) {
    Object.assign(this, order);
  }
}
