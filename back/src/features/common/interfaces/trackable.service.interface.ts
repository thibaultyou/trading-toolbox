export interface ITrackableService<T> {
  startTrackingAccount(accountId: string): void;
  stopTrackingAccount(accountId: string): void;
  refreshOne(accountId: string): Promise<T>;
  refreshAll(): Promise<void>;
}
