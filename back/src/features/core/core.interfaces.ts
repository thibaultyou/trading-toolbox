export interface ITickerData {
  bid1Price?: string;
  ask1Price?: string;
  // bid1Volume?: string;
  // ask1Volume?: string;
}

export interface IExecutionData {
  // blockTradeId: string;
  // category: string;
  // execFee: string;
  // execId: string;
  execPrice: string;
  execQty: string;
  // execTime: string;
  // execType: string;
  execValue: string;
  // feeRate: string;
  // indexPrice: string;
  // isLeverage: string;
  // isMaker: boolean;
  leavesQty: string;
  // markIv: string;
  markPrice: string;
  orderId: string;
  orderLinkId: string;
  orderPrice: string;
  orderQty: string;
  orderType: string;
  symbol: string;
  // stopOrderType: string;
  side: string;
  // tradeIv: string;
  // underlyingPrice: string;
  // closedSize: string;
  // seq: number;
  // createType: string;
}

export interface IWalletData {
  accountType: string;
  coin: Array<{
    coin: string;
    equity: string;
    walletBalance: string;
    availableToWithdraw: string;
    unrealisedPnl: string;
    cumRealisedPnl: string;
  }>;
  // coin: Array<{
  // usdValue: string;
  // borrowAmount: string;
  // availableToBorrow: string;
  // accruedInterest: string;
  // totalOrderIM: string;
  // totalPositionIM: string;
  // totalPositionMM: string;
  // }>
  // accountIMRate: string;
  // accountMMRate: string;
  // accountLTV: string;
  // totalEquity: string;
  // totalWalletBalance: string;
  // totalMarginBalance: string;
  // totalAvailableBalance: string;
  // totalPerpUPL: string;
  // totalInitialMargin: string;
  // totalMaintenanceMargin: string;
}

// export interface IOrderData {
//   avgPrice: string;
//   // blockTradeId: string;
//   // cancelType: string;
//   // category: string;
//   // closeOnTrigger: boolean;
//   // createdTime: string;
//   cumExecFee: string;
//   cumExecQty: string;
//   cumExecValue: string;
//   leavesQty: string;
//   leavesValue: string;
//   orderId: string;
//   orderIv: string;
//   isLeverage: string;
//   lastPriceOnCreated: string;
//   orderStatus: string;
//   orderLinkId: string;
//   orderType: string;
//   positionIdx: number;
//   price: string;
//   qty: string;
//   reduceOnly: boolean;
//   rejectReason: string;
//   side: string;
//   slTriggerBy: string;
//   stopLoss: string;
//   stopOrderType: string;
//   symbol: string;
//   takeProfit: string;
//   timeInForce: string;
//   tpTriggerBy: string;
//   triggerBy: string;
//   triggerDirection: number;
//   triggerPrice: string;
//   updatedTime: string;
//   placeType: string;
//   smpType: string;
//   smpGroup: number;
//   smpOrderId: string;
//   tpslMode: string;
//   createType: string;
//   tpLimitPrice: string;
//   slLimitPrice: string;
// }

// export interface IPositionData {
//   bustPrice: string;
//   category: string;
//   createdTime: string;
//   cumRealisedPnl: string;
//   curRealisedPnl: string;
//   entryPrice: string;
//   leverage: string;
//   liqPrice: string;
//   markPrice: string;
//   positionBalance: string;
//   positionIdx: number;
//   positionMM: string;
//   positionIM: string;
//   positionStatus: string;
//   positionValue: string;
//   riskId: number;
//   riskLimitValue: string;
//   side: string;
//   size: string;
//   stopLoss: string;
//   symbol: string;
//   takeProfit: string;
//   tpslMode: string;
//   tradeMode: number;
//   autoAddMargin: number;
//   trailingStop: string;
//   unrealisedPnl: string;
//   updatedTime: string;
//   adlRankIndicator: number;
//   seq: number;
//   isReduceOnly: boolean;
//   mmrSysUpdateTime: string;
//   leverageSysUpdatedTime: string;
// }
