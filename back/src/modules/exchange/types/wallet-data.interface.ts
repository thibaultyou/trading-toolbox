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
}
