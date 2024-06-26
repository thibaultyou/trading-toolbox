import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'ccxt';

import { fromOrdertoInternalOrder } from '../order.utils';
import { IOrder } from '../types/order.interface';
import { OrderSide } from '../types/order-side.enum';
import { OrderType } from '../types/order-type.enum';

export class OrderReadResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: '3f309063-cfd1-4ce8-ad74-77c94b01563f'
  })
  id: string;

  @ApiProperty({
    description: 'External order link ID, used for tracking the order on external systems or client side',
    example: '3cms_req_t_697716177_3'
  })
  linkId: string;

  @ApiProperty({
    description: 'Trading symbol for the order',
    example: 'DOGEUSDT'
  })
  marketId: string;

  @ApiProperty({
    description: 'Price per unit for the order',
    example: 0.22184,
    type: Number
  })
  price: number;

  @ApiProperty({
    description: 'Amount of the asset to buy or sell',
    example: 33,
    type: Number
  })
  amount: number;

  @ApiProperty({
    description: 'Order side, indicating whether the order is a buy or sell',
    example: OrderSide.SELL,
    enum: OrderSide
  })
  side: OrderSide;

  @ApiProperty({
    description: 'Current status of the order',
    example: 'canceled'
  })
  status: Order['status'];

  @ApiProperty({
    description: 'Type of the order, e.g., limit or market',
    example: OrderType.LIMIT,
    enum: OrderType
  })
  type: OrderType;

  @ApiProperty({
    description: 'Quantity of the order that has not been filled',
    example: 0,
    type: Number
  })
  leavesQty: number;

  @ApiProperty({
    description: 'Mode for Take Profit and Stop Loss',
    example: 'Partial'
  })
  tpslMode: Order['info']['tpslMode'];

  @ApiProperty({
    description: 'Price at which the order is triggered',
    example: 0.5,
    type: Number
  })
  triggerPrice: number;

  @ApiProperty({
    description: 'Timestamp when the order was created',
    example: 1711934440046,
    type: Number
  })
  createdTime: number;

  @ApiProperty({
    description: 'Timestamp when the order was last updated',
    example: 1711950591199,
    type: Number
  })
  updatedTime: number;

  constructor(order: Order) {
    const internalOrder: IOrder = fromOrdertoInternalOrder(order);
    this.id = internalOrder.id;
    this.linkId = internalOrder.linkId;
    this.marketId = internalOrder.marketId;
    this.price = internalOrder.price;
    this.amount = internalOrder.amount;
    this.side = internalOrder.side;
    this.status = internalOrder.status;
    this.type = internalOrder.type;
    this.leavesQty = internalOrder.leavesQty;
    this.tpslMode = internalOrder.tpslMode;
    this.triggerPrice = internalOrder.triggerPrice;
    this.createdTime = internalOrder.createdTime;
    this.updatedTime = internalOrder.updatedTime;
  }
}
