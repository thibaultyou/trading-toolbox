export class BalancesUpdatedEvent {
  public readonly accountId: string;

  public readonly usdtEquity: number;

  constructor(accountId: string, usdtEquity: number) {
    this.accountId = accountId;
    this.usdtEquity = usdtEquity;
  }
}
