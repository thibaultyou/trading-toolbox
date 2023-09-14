import { Order } from 'ccxt';

export interface IExchangeService {
  initialize(): void;
  getBalance(): Promise<number>;
  getTickers(): Promise<string[]>;
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
  closeOrder(orderId: string, symbol: string): Promise<Order>;
  closeOrdersWithSymbol(symbol: string): Promise<Order>;
  fetchOpenOrders(): Promise<Order[]>;
  cleanResources(): void;
  performWsAction(
    action: string,
    topic: string,
    actionDescription: string,
  ): void;
}
