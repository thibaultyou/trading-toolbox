import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'ccxt';

export class OrderCreateResponseDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  orderLinkId: string;

  @ApiProperty()
  symbol: string;

  constructor(order: Order) {
    this.orderId = order.info.orderId;
    this.symbol = order.symbol;
  }
}
