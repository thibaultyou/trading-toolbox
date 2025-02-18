import { Injectable } from '@nestjs/common';
import { FuturesHistoryOrderV2, FuturesOpenOrderV2 } from 'bitget-api';
import { Order, Position } from 'ccxt';

type BitgetOrder =
  | FuturesOpenOrderV2
  | FuturesHistoryOrderV2
  | {
      symbol: string;
      size: string;
      orderId: string;
      clientOid: string;
      baseVolume: string;
      priceAvg: string;
      fee: string;
      price: string;
      state: string;
      side: string;
      force: string;
      totalProfits: string;
      posSide: string;
      marginCoin: string;
      presetStopSurplusPrice: string;
      presetStopLossPrice: string;
      quoteVolume: string;
      orderType: string;
      leverage: string;
      marginMode: string;
      reduceOnly: string;
      enterPointSource: string;
      tradeSide: string;
      posMode: string;
      orderSource: string;
      cancelReason: string;
      cTime: string;
      uTime: string;
    };

@Injectable()
export class BitgetMapperService {
  public fromBitgetOpenOrdersToCCXTOrders(bitgetOrders: (FuturesOpenOrderV2 | BitgetOrder)[]): Order[] {
    return bitgetOrders.map((bitgetOrder) => this.mapSingleOpenOrder(bitgetOrder));
  }

  public fromBitgetClosedOrdersToCCXTOrders(bitgetOrders: (FuturesHistoryOrderV2 | BitgetOrder)[]): Order[] {
    return bitgetOrders.map((bitgetOrder) => this.mapSingleClosedOrder(bitgetOrder));
  }

  public mapSingleOpenOrder(entry: BitgetOrder): Order {
    const bitgetStatus = (entry as any).status || (entry as any).state;
    const ccxtStatus = this.mapOrderStatus(bitgetStatus);
    const ccxtSide = entry.side?.toLowerCase() === 'buy' ? 'buy' : 'sell';
    const ccxtType = entry.orderType?.toLowerCase();
    const ccxtTimeInForce = entry.force?.toUpperCase();
    const parsedPrice = parseFloat(entry.price || '0');
    const parsedAvgPrice = parseFloat(entry.priceAvg || '0');
    const parsedSize = parseFloat(entry.size || '0');
    const parsedFilled = parseFloat(entry.baseVolume || '0');
    const parsedFee = parseFloat(entry.fee || '0');
    const createdTs = parseInt(entry.cTime, 10);
    const updatedTs = parseInt(entry.uTime, 10);
    const ccxtSymbol = this.mapSymbol(entry.symbol, entry.marginCoin);
    const cost = parsedFilled * parsedAvgPrice;
    const isReduceOnly = entry.tradeSide?.toLowerCase() === 'close';
    return {
      id: entry.orderId,
      clientOrderId: entry.clientOid || undefined,
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
        currency: entry.marginCoin?.toUpperCase() || 'USDT'
      },
      reduceOnly: isReduceOnly,
      postOnly: false,
      info: entry
    } as Order;
  }

  public mapSingleClosedOrder(entry: BitgetOrder): Order {
    const bitgetStatus = (entry as any).status || (entry as any).state;
    const ccxtStatus = this.mapOrderStatus(bitgetStatus);
    const ccxtSide = entry.side?.toLowerCase() === 'buy' ? 'buy' : 'sell';
    const ccxtType = entry.orderType?.toLowerCase();
    const ccxtTimeInForce = entry.force?.toUpperCase();
    const parsedPrice = parseFloat(entry.price || '0');
    const parsedAvgPrice = parseFloat(entry.priceAvg || '0');
    const parsedSize = parseFloat(entry.size || '0');
    const parsedFilled = parseFloat(entry.baseVolume || '0');
    const parsedFee = parseFloat(entry.fee || '0');
    const createdTs = parseInt(entry.cTime, 10);
    const updatedTs = parseInt(entry.uTime, 10);
    const ccxtSymbol = this.mapSymbol(entry.symbol, entry.marginCoin);
    const cost = parsedFilled * parsedAvgPrice;
    const isReduceOnly = entry.tradeSide?.toLowerCase() === 'close';
    const takeProfitPrice = entry.presetStopSurplusPrice ? parseFloat(entry.presetStopSurplusPrice) : undefined;
    const stopLossPrice = entry.presetStopLossPrice ? parseFloat(entry.presetStopLossPrice) : undefined;
    return {
      id: entry.orderId,
      clientOrderId: entry.clientOid || undefined,
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
        currency: entry.marginCoin?.toUpperCase() || 'USDT'
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
