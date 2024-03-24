import { Balances, Market, Order, Position } from 'ccxt';

export interface IExchangeService {
  initialize(): Promise<boolean>;
  testCredentials(): Promise<void>;
  getBalances(): Promise<Balances>;
  getMarkets(): Promise<Market[]>;
  getOpenOrders(): Promise<Order[]>;
  getOpenPositions(): Promise<Position[]>;
  openMarketLongOrder(symbol: string, size: number): Promise<Order>;
  openMarketShortOrder(symbol: string, size: number): Promise<Order>;
  openLimitLongOrder(
    symbol: string,
    size: number,
    price: number,
  ): Promise<Order>;
  openLimitShortOrder(
    symbol: string,
    size: number,
    price: number,
  ): Promise<Order>;
  updateStopLoss(
    orderId: string,
    symbol: string,
    amount: number,
    stopLossPrice: number,
  ): Promise<Order>;
  updateTakeProfit(
    orderId: string,
    symbol: string,
    amount: number,
    takeProfitPrice: number,
  ): Promise<Order>;
  closeOrder(orderId: string, symbol: string): Promise<boolean>;
  closeOrdersWithSymbol(symbol: string): Promise<boolean>;
  clean(): Promise<void>;
}
