import { Balances, Market, Order, Position } from 'ccxt';

import { OrderSide, OrderType } from '../order/order.types';

export interface IExchangeService {
  initialize(): Promise<boolean>;
  // getBalances(): TE.TaskEither<Error, Balances>;
  getBalances(): Promise<Balances>;
  getMarkets(): Promise<Market[]>;
  getOpenOrders(): Promise<Order[]>;
  getOrder(orderId: string, symbol: string): Promise<Order>;
  getOrders(symbol?: string, params?: Record<string, any>): Promise<Order[]>;
  getOpenPositions(): Promise<Position[]>;
  openOrder(
    symbol: string,
    type: OrderType,
    side: OrderSide,
    quantity: number,
    price?: number,
    takeProfitPrice?: number,
    stopLossPrice?: number,
    params?: Record<string, any>
  ): Promise<Order>;
  updateOrder(
    orderId: string,
    symbol: string,
    type: string,
    side: OrderSide,
    quantity?: number,
    price?: number,
    params?: Record<string, any>
  ): Promise<Order>;
  closePosition(symbol: string, side: OrderSide, quantity: number): Promise<Order>;
  cancelOrders(symbol: string, params?: Record<string, any>): Promise<Order[]>;
  cancelOrder(orderId: string, symbol: string): Promise<Order>;
  clean(): Promise<void>;

  // updateStopLoss(orderId: string, symbol: string, amount: number, stopLossPrice: number): Promise<Order>;
  // updateTakeProfit(orderId: string, symbol: string, amount: number, takeProfitPrice: number): Promise<Order>;
}
