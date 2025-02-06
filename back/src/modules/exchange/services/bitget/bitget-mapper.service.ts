import { Injectable } from '@nestjs/common';
import { FuturesHistoryOrderV2, FuturesOpenOrderV2 } from 'bitget-api';
import { Order, Position } from 'ccxt';

@Injectable()
export class BitgetMapperService {
  public fromBitgetOpenOrdersToCCXTOrders(bitgetOrders: FuturesOpenOrderV2[]): Order[] {
    return bitgetOrders.map((bitgetOrder) => this.mapSingleOpenOrder(bitgetOrder));
  }

  public fromBitgetClosedOrdersToCCXTOrders(bitgetOrders: FuturesHistoryOrderV2[]): Order[] {
    return bitgetOrders.map((bitgetOrder) => this.mapSingleClosedOrder(bitgetOrder));
  }

  private mapSingleOpenOrder(entry: FuturesOpenOrderV2): Order {
    const {
      orderId,
      clientOid,
      cTime,
      uTime,
      symbol,
      side,
      orderType,
      force,
      price,
      priceAvg,
      size,
      baseVolume,
      status,
      fee,
      marginCoin,
      tradeSide
    } = entry;
    const ccxtStatus = this.mapOrderStatus(status);
    const ccxtSide = side?.toLowerCase() === 'buy' ? 'buy' : 'sell';
    const ccxtType = orderType?.toLowerCase();
    const ccxtTimeInForce = force?.toUpperCase();
    const parsedPrice = parseFloat(price || '0');
    const parsedAvgPrice = parseFloat(priceAvg || '0');
    const parsedSize = parseFloat(size || '0');
    const parsedFilled = parseFloat(baseVolume || '0');
    const parsedFee = parseFloat(fee || '0');
    const createdTs = parseInt(cTime, 10);
    const updatedTs = parseInt(uTime, 10);
    const ccxtSymbol = this.mapSymbol(symbol, marginCoin);
    const cost = parsedFilled * parsedAvgPrice;
    const isReduceOnly = tradeSide?.toLowerCase() === 'close';
    return {
      id: orderId,
      clientOrderId: clientOid || undefined,
      datetime: createdTs ? new Date(createdTs).toISOString() : undefined,
      timestamp: createdTs || undefined,
      lastTradeTimestamp: updatedTs || undefined,
      lastUpdateTimestamp: updatedTs || undefined,

      status: ccxtStatus,
      symbol: ccxtSymbol,
      type: ccxtType,
      timeInForce: ccxtTimeInForce,
      side: ccxtSide,
      price: parsedPrice,
      average: parsedAvgPrice,

      amount: parsedSize,
      filled: parsedFilled,
      remaining: parsedSize - parsedFilled,

      stopPrice: undefined,
      triggerPrice: undefined,
      takeProfitPrice: undefined,
      stopLossPrice: undefined,

      cost,
      trades: [],
      fee: {
        cost: parsedFee,
        currency: marginCoin?.toUpperCase() || 'USDT'
      },
      reduceOnly: isReduceOnly,
      postOnly: false,
      info: entry
    } as Order;
  }

  private mapSingleClosedOrder(entry: FuturesHistoryOrderV2): Order {
    const {
      orderId,
      clientOid,
      cTime,
      uTime,
      symbol,
      side,
      orderType,
      force,
      price,
      priceAvg,
      size,
      baseVolume,
      status,
      fee,
      marginCoin,
      tradeSide,
      presetStopLossPrice,
      presetStopSurplusPrice
    } = entry;
    const ccxtStatus = this.mapOrderStatus(status);
    const ccxtSide = side?.toLowerCase() === 'buy' ? 'buy' : 'sell';
    const ccxtType = orderType?.toLowerCase();
    const ccxtTimeInForce = force?.toUpperCase();
    const parsedPrice = parseFloat(price || '0');
    const parsedAvgPrice = parseFloat(priceAvg || '0');
    const parsedSize = parseFloat(size || '0');
    const parsedFilled = parseFloat(baseVolume || '0');
    const parsedFee = parseFloat(fee || '0');
    const createdTs = parseInt(cTime, 10);
    const updatedTs = parseInt(uTime, 10);
    const ccxtSymbol = this.mapSymbol(symbol, marginCoin);
    const cost = parsedFilled * parsedAvgPrice;
    const isReduceOnly = tradeSide?.toLowerCase() === 'close';
    const takeProfitPrice = presetStopSurplusPrice ? parseFloat(presetStopSurplusPrice) : undefined;
    const stopLossPrice = presetStopLossPrice ? parseFloat(presetStopLossPrice) : undefined;
    return {
      id: orderId,
      clientOrderId: clientOid || undefined,
      datetime: createdTs ? new Date(createdTs).toISOString() : undefined,
      timestamp: createdTs || undefined,
      lastTradeTimestamp: updatedTs || undefined,
      lastUpdateTimestamp: updatedTs || undefined,

      status: ccxtStatus,
      symbol: ccxtSymbol,
      type: ccxtType,
      timeInForce: ccxtTimeInForce,
      side: ccxtSide,
      price: parsedPrice,
      average: parsedAvgPrice,

      amount: parsedSize,
      filled: parsedFilled,
      remaining: parsedSize - parsedFilled,

      takeProfitPrice,
      stopLossPrice,
      stopPrice: undefined,
      triggerPrice: undefined,

      cost,
      trades: [],
      fee: {
        cost: parsedFee,
        currency: marginCoin?.toUpperCase() || 'USDT'
      },
      reduceOnly: isReduceOnly,
      postOnly: false,
      info: entry
    } as Order;
  }

  private mapOrderStatus(bitgetStatus: string): string {
    switch (bitgetStatus) {
      case 'live':
        return 'open';
      case 'filled':
        return 'closed';
      case 'canceled':
        return 'canceled';
      default:
        return bitgetStatus;
    }
  }

  private mapSymbol(symbol: string, marginCoin: string): string {
    if (!symbol || !marginCoin || !symbol.endsWith(marginCoin)) {
      return symbol || '';
    }

    const base = symbol.slice(0, symbol.length - marginCoin.length);
    return `${base}/${marginCoin}:${marginCoin}`;
  }

  public mapPosition(position: Position): Position {
    const raw = position.info || {};
    const takeProfit = raw.takeProfit;
    const stopLoss = raw.stopLoss;
    return {
      ...position,
      takeProfitPrice: takeProfit ? parseFloat(takeProfit) : undefined,
      stopLossPrice: stopLoss ? parseFloat(stopLoss) : undefined
    };
  }
}
