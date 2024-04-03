import { Balances, Market, Order, Position } from 'ccxt';

import { OrderSide } from '../order/order.types';

export interface IExchangeService {
  initialize(): Promise<boolean>;
  testCredentials(): Promise<void>;
  getBalances(): Promise<Balances>;
  getMarkets(): Promise<Market[]>;
  getOpenOrders(): Promise<Order[]>;
  getOrder(orderId: string, symbol: string): Promise<Order>;
  getOrders(symbol?: string, params?: Record<string, any>): Promise<Order[]>;
  getOpenPositions(): Promise<Position[]>;

  openOrder(
    symbol: string,
    side: OrderSide,
    volume: number,
    price?: number,
    stopLossPrice?: number,
    takeProfitPrice?: number,
    params?: Record<string, any>
  ): Promise<Order[]>;
  closePosition(symbol: string, side: OrderSide, volume: number): Promise<Order>;

  // openMarketLongOrder(symbol: string, size: number): Promise<Order>;
  // openMarketShortOrder(symbol: string, size: number): Promise<Order>;
  // openLimitLongOrder(symbol: string, size: number, price: number): Promise<Order>;
  // openLimitShortOrder(symbol: string, size: number, price: number): Promise<Order>;
  updateStopLoss(orderId: string, symbol: string, amount: number, stopLossPrice: number): Promise<Order>;
  updateTakeProfit(orderId: string, symbol: string, amount: number, takeProfitPrice: number): Promise<Order>;
  closeOrder(orderId: string, symbol: string): Promise<boolean>;
  closeOrdersWithSymbol(symbol: string): Promise<boolean>;
  clean(): Promise<void>;
}
