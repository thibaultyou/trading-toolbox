import { Market, Order } from 'ccxt';

export interface IExchangeService {
  initialize(): Promise<void>;
  testCredentials(): Promise<void>;
  getBalance(): Promise<number>;
  getUsdtMarkets(): Promise<Market[]>;
  getOpenPositions(): Promise<any>;
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
  fetchOpenOrders(): Promise<Order[]>;
  cleanResources(): void;
  performWsAction(
    action: string,
    topic: string,
    actionDescription: string,
  ): void;
}
