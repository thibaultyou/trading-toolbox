export class ExchangeTerminatedEvent {
  public readonly accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }
}
