export interface ITrackableService<T> {
  addAccount(accountId: string): void;
  removeAccount(accountId: string): void;
  refreshOne(accountId: string): Promise<T>;
  refreshAll(): Promise<void>;
}
