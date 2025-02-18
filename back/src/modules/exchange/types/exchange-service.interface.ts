import { Balances, Market, Order, Position, Ticker } from 'ccxt';

import { OrderSide } from '@order/types/order-side.enum';
import { OrderType } from '@order/types/order-type.enum';

export interface IExchangeService {
  initialize(): Promise<boolean>;
  // getBalances(): TE.TaskEither<Error, Balances>;
  getBalances(): Promise<Balances>;
  getTicker(symbol: string): Promise<Ticker>;
  getMarkets(): Promise<Market[]>;
  getOpenOrders(symbol?: string): Promise<Order[]>;
  getClosedOrders(symbol?: string, params?: Record<string, any>): Promise<Order[]>;
  getOrder(orderId: string, symbol?: string): Promise<Order>;
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
  closePosition(symbol: string, side: OrderSide): Promise<Order>;
  cancelOrders(symbol: string, params?: Record<string, any>): Promise<Order[]>;
  cancelOrder(orderId: string, symbol: string): Promise<Order>;
  clean(): Promise<void>;

  // updateStopLoss(orderId: string, symbol: string, amount: number, stopLossPrice: number): Promise<Order>;
  // updateTakeProfit(orderId: string, symbol: string, amount: number, takeProfitPrice: number): Promise<Order>;
}
