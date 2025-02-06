export interface IAccountSynchronizer<T> {
  syncAccount(accountId: string): Promise<T>;
  syncAllAccounts(): Promise<void>;
}
