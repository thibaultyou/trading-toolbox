export interface ICoinData {
  coin: string;
  equity: string;
  walletBalance: string;
  availableToWithdraw: string;
  unrealisedPnl?: string;
  cumRealisedPnl?: string;
}
