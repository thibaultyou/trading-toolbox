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

  fromExternal(external: any): IOrder {
    const order: Order = external;
    const info = order.info || {};
    // NOTE Use Bitget's cTime and uTime if available; otherwise, fall back to createdTime/updatedTime
    const createdTime = info.cTime ? parseInt(info.cTime, 10) : info.createdTime ? parseInt(info.createdTime, 10) : 0;
    const updatedTime = info.uTime ? parseInt(info.uTime, 10) : info.updatedTime ? parseInt(info.updatedTime, 10) : 0;
    // NOTE For Bybit orders, info.leavesQty may be provided.
    // For Bitget orders, compute it as size - baseVolume if leavesQty is missing.
    const leavesQty =
      info.leavesQty !== undefined && info.leavesQty !== null && info.leavesQty !== ''
        ? parseFloat(info.leavesQty)
        : (info.size ? parseFloat(info.size) : 0) - (info.baseVolume ? parseFloat(info.baseVolume) : 0);
    // NOTE If the order's tradeSide is 'close', then the raw side is reversed:
    //   - if rawSide === 'buy', then final side becomes 'sell'
    //   - if rawSide === 'sell', then final side becomes 'buy'
    const rawSide = info.side ? info.side.toLowerCase() : '';
    const tradeSide = info.tradeSide ? info.tradeSide.toLowerCase() : '';
    let finalSide = rawSide;

    if (tradeSide === 'close') {
      if (rawSide === 'buy') {
        finalSide = 'sell';
      } else if (rawSide === 'sell') {
        finalSide = 'buy';
      }
    }
    return {
      id: info.orderId,
      linkId: info.orderLinkId,
      marketId: info.symbol,
      price: info.price ? parseFloat(info.price) : 0,
      amount: order.amount || (info.size ? parseFloat(info.size) : 0),
      side: finalSide === 'buy' ? OrderSide.BUY : OrderSide.SELL,
      status: order.status,
      type: info.orderType && info.orderType.toLowerCase() === 'limit' ? OrderType.LIMIT : OrderType.MARKET,
      leavesQty,
      tpslMode: info.tpslMode,
      triggerPrice: info.triggerPrice ? parseFloat(info.triggerPrice) : null,
      createdTime,
      updatedTime
    };
  }
}
