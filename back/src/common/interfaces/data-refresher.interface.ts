export interface IDataRefresher<T> {
  refreshOne(accountId: string): Promise<T>;
  refreshAll(): Promise<void>;
}
