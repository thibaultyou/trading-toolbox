import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'ccxt';

import { OrderSide, OrderType } from '../order.types';

export class OrderReadResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: '3f309063-cfd1-4ce8-ad74-77c94b01563f'
  })
  orderId: string;

  @ApiProperty({
    description: 'External order link ID, used for tracking the order on external systems or client side',
    example: '3cms_req_t_697716177_3'
  })
  orderLinkId: string;

  @ApiProperty({
    description: 'Trading symbol for the order',
    example: 'DOGEUSDT'
  })
  symbol: string;

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
    example: OrderSide.Sell,
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
    example: OrderType.Limit,
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
    this.orderId = order.info.orderId;
    this.orderLinkId = order.info.orderLinkId;
    this.symbol = order.info.symbol;
    this.price = parseFloat(order.info.price);
    this.amount = order.amount;
    this.side = order.info.side.toLowerCase() === 'buy' ? OrderSide.Buy : OrderSide.Sell;
    this.status = order.status;
    this.type = order.info.orderType.toLowerCase() === 'limit' ? OrderType.Limit : OrderType.Market;
    this.leavesQty = parseFloat(order.info.leavesQty);
    this.createdTime = parseInt(order.info.createdTime);
    this.updatedTime = parseInt(order.info.updatedTime);
  }
}
