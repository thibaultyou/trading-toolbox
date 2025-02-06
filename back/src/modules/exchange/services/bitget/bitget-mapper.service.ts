import { Injectable } from '@nestjs/common';
import { Order, Position } from 'ccxt';

/**
 * The structure from your reference:
 *
 * export interface FuturesOpenOrderV2 {
 *   symbol: string;
 *   size: string;
 *   orderId: string;
 *   clientOid: string;
 *   baseVolume: string;  // filled base?
 *   fee: string;
 *   price: string;
 *   priceAvg: string;    // average fill price
 *   status: string;      // e.g. "live"
 *   side: string;        // "buy" or "sell"
 *   force: string;       // e.g. "gtc"
 *   totalProfits: string;
 *   posSide: string;     // "long" or "short"
 *   marginCoin: string;  // "USDT"
 *   quoteVolume: string;
 *   leverage: string;
 *   marginMode: string;  // "crossed" or "isolated"
 *   tradeSide: string;   // "open" or "close"
 *   posMode: string;     // "hedge_mode"
 *   orderType: string;   // "limit" or "market"
 *   orderSource: string; // "normal"
 *   cTime: string;       // created time
 *   uTime: string;       // update time
 *   reduceOnly: string;  // "YES" or "NO"
 *   ...
 * }
 */

@Injectable()
export class BitgetMapperService {
  /**
   * Converts an array of Bitget FuturesOpenOrderV2 into an array of CCXT Orders.
   */
  public fromBitgetOpenOrdersToCCXTOrders(bitgetOrders: any[]): Order[] {
    return bitgetOrders.map((bitgetOrder) => this.mapSingleOrder(bitgetOrder));
  }

  /**
   * Maps a single Bitget open order record to a CCXT Order.
   */
  private mapSingleOrder(entry: any): Order {
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
      reduceOnly
    } = entry;

    // Convert status to a CCXT-friendly one
    const ccxtStatus = this.mapOrderStatus(status);

    // Convert side properly (Bitget uses "buy" or "sell")
    // CCXT also uses "buy"/"sell" but just ensure it's lowercase
    const ccxtSide = side?.toLowerCase() === 'buy' ? 'buy' : 'sell';

    // Convert order type: "limit" / "market" / "limit_maker" etc.
    // In Bitget, "orderType" is typically "limit" or "market"
    const ccxtType = orderType?.toLowerCase();

    // Convert GTC/IOC/FOK if needed from "force"
    // e.g. "gtc" => "GTC", "ioc" => "IOC"
    const ccxtTimeInForce = force?.toUpperCase();

    // Parse numeric fields
    const parsedPrice = parseFloat(price || '0');
    const parsedAvgPrice = parseFloat(priceAvg || '0');
    const parsedSize = parseFloat(size || '0');
    const parsedFilled = parseFloat(baseVolume || '0'); // baseVolume is how much filled
    const parsedFee = parseFloat(fee || '0');

    // Timestamps
    const createdTs = parseInt(cTime, 10);
    const updatedTs = parseInt(uTime, 10);

    // Symbol transformation: e.g. "DOGEUSDT" => "DOGE/USDT:USDT"
    // If you prefer simpler "DOGE/USDT", you can do so:
    const ccxtSymbol = this.mapSymbol(symbol, marginCoin);

    // Derive cost = filled * averageFillPrice
    const cost = parsedFilled * parsedAvgPrice;

    // reduceOnly => "YES" => true, else false
    const isReduceOnly = (reduceOnly || 'NO').toUpperCase() === 'YES';

    return {
      id: orderId,
      clientOrderId: clientOid || undefined,
      datetime: createdTs ? new Date(createdTs).toISOString() : undefined,
      timestamp: createdTs || undefined,
      lastTradeTimestamp: updatedTs || undefined,
      lastUpdateTimestamp: updatedTs || undefined,

      status: ccxtStatus, // 'open', 'closed', 'canceled', etc.
      symbol: ccxtSymbol, // "DOGE/USDT:USDT" or "DOGE/USDT"
      type: ccxtType, // 'limit' or 'market'
      timeInForce: ccxtTimeInForce,
      side: ccxtSide, // 'buy' or 'sell'
      price: parsedPrice,
      average: parsedAvgPrice,

      // total amount ordered vs. filled vs. remaining
      amount: parsedSize,
      filled: parsedFilled,
      remaining: parsedSize - parsedFilled,

      // optional stop triggers
      stopPrice: undefined, // not provided in the data
      triggerPrice: undefined, // not provided in the data
      takeProfitPrice: undefined, // not provided in the data
      stopLossPrice: undefined, // not provided in the data

      cost,
      trades: [], // no direct trades from this endpoint
      fee: {
        cost: parsedFee,
        currency: marginCoin?.toUpperCase() || 'USDT'
      },
      reduceOnly: isReduceOnly,
      postOnly: false, // typically false unless you see a param for that
      info: entry // store the raw data in `info`
    } as Order;
  }

  /**
   * Converts Bitget order status (like 'live', 'filled', etc.) to CCXT.
   */
  private mapOrderStatus(bitgetStatus: string): string {
    // Bitget returns "live", "filled", "canceled", ...
    // Convert them to CCXT equivalents:
    switch (bitgetStatus) {
      case 'live':
        return 'open';
      case 'filled':
        return 'closed';
      case 'canceled':
        return 'canceled';
      default:
        return bitgetStatus; // pass through unrecognized statuses
    }
  }

  /**
   * Formats the symbol from Bitget's "DOGEUSDT" into a CCXT-like "DOGE/USDT:USDT".
   * If you prefer simpler "DOGE/USDT", adjust accordingly.
   */
  private mapSymbol(symbol: string, marginCoin: string): string {
    // e.g. "DOGEUSDT" => "DOGE/USDT"
    // Then we can append :USDT if we want the ccxt future style
    // But if you want simpler "DOGE/USDT", omit the :USDT.

    if (!symbol?.endsWith(marginCoin)) {
      return symbol || '';
    }

    // e.g. "DOGEUSDT" => "DOGE/USDT"
    const base = symbol.slice(0, symbol.length - marginCoin.length);
    return `${base}/${marginCoin}:${marginCoin}`;
  }

  public mapPosition(position: Position): Position {
    // Check if the raw info contains the extra fields
    const raw = position.info || {};
    // Bitget returns these as strings; parse if they exist.
    const takeProfit = raw.takeProfit;
    const stopLoss = raw.stopLoss;

    return {
      ...position,
      // ccxt's Position interface has optional takeProfitPrice/stopLossPrice properties
      takeProfitPrice: takeProfit ? parseFloat(takeProfit) : undefined,
      stopLossPrice: stopLoss ? parseFloat(stopLoss) : undefined
    };
  }
}
