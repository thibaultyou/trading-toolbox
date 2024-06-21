export interface IAccountTracker {
  startTrackingAccount(accountId: string): Promise<void>;
  stopTrackingAccount(accountId: string): void;
}
