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
