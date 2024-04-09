export class WebSocketUnsubscribeEvent {
  public readonly accountId: string;

  public readonly topics: string[] | string;

  constructor(accountId: string, topics: string[] | string) {
    this.accountId = accountId;
    this.topics = topics;
  }
}
