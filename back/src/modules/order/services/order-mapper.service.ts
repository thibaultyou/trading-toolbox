import { Injectable } from '@nestjs/common';
import { Order } from 'ccxt';

import { OrderDto } from '@order/dtos/order.dto';
import { OrderSide } from '@order/types/order-side.enum';
import { OrderType } from '@order/types/order-type.enum';
import { IOrder } from '@order/types/order.interface';

@Injectable()
export class OrderMapperService {
  toDto(order: IOrder): OrderDto {
    return new OrderDto(order);
  }

  fromExternalOrder(order: Order): IOrder {
    return {
      id: order.info.orderId,
      linkId: order.info.orderLinkId,
      marketId: order.info.symbol,
      price: parseFloat(order.info.price),
      amount: order.amount,
      side: order.side.toLowerCase() === 'buy' ? OrderSide.BUY : OrderSide.SELL,
      status: order.status,
      type: order.info.orderType.toLowerCase() === 'limit' ? OrderType.LIMIT : OrderType.MARKET,
      leavesQty: parseFloat(order.info.leavesQty),
      tpslMode: order.info.tpslMode,
      triggerPrice: parseFloat(order.info.triggerPrice),
      createdTime: parseInt(order.info.createdTime),
      updatedTime: parseInt(order.info.updatedTime)
    };
  }
}
