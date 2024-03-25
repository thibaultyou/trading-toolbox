import { MinMax } from 'ccxt';

export enum ExchangeType {
  // TODO Replace with CamelCase
  Bybit = 'bybit'
}

export type OrderExecutionData = {
  blockTradeId: string;
  category: string;
  execFee: string;
  execId: string;
  execPrice: string;
  execQty: string;
  execTime: string;
  execType: string;
  execValue: string;
  feeRate: string;
  indexPrice: string;
  isLeverage: string;
  isMaker: boolean;
  leavesQty: string;
  markIv: string;
  markPrice: string;
  orderId: string;
  orderLinkId: string;
  orderPrice: string;
  orderQty: string;
  orderType: string;
  symbol: string;
  stopOrderType: string;
  side: 'Buy' | 'Sell';
  tradeIv: string;
  underlyingPrice: string;
  closedSize: string;
};

export interface Precision {
  amount: number | undefined;
  price: number | undefined;
}

export interface Limits {
  amount?: MinMax;
  cost?: MinMax;
  price?: MinMax;
  leverage?: MinMax;
}
