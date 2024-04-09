import { Balances, Market, Order, Position } from 'ccxt';
import * as TE from 'fp-ts/TaskEither';

import { OrderSide } from '../order/order.types';

export interface IExchangeService {
  initialize(): Promise<boolean>;
  getBalances(): TE.TaskEither<Error, Balances>;

  // getBalances(): Promise<Balances>;
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
  ): Promise<Order>;
  updateOrder(
    orderId: string,
    symbol: string,
    type: string,
    side: OrderSide,
    volume?: number,
    price?: number,
    params?: Record<string, any>
  ): Promise<Order>;
  closePosition(symbol: string, side: OrderSide, volume: number): Promise<Order>;
  cancelOrders(symbol: string, params?: Record<string, any>): Promise<Order[]>;
  cancelOrder(orderId: string, symbol: string): Promise<Order>;
  clean(): Promise<void>;

  // updateStopLoss(orderId: string, symbol: string, amount: number, stopLossPrice: number): Promise<Order>;
  // updateTakeProfit(orderId: string, symbol: string, amount: number, takeProfitPrice: number): Promise<Order>;
}
