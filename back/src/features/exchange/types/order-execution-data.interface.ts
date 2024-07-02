export interface IOrderExecutionData {
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
}
