export class OrderUpdatedEvent {
  public readonly accountId: string;

  public readonly id: string;

  public readonly linkId: string;

  constructor(accountId: string, orderId: string, orderLinkId: string) {
    this.accountId = accountId;
    this.id = orderId;
    this.linkId = orderLinkId;
  }
}
