export class OrderUpdatedEvent {
  public readonly accountId: string;

  public readonly orderId: string;

  public readonly orderLinkId: string;

  constructor(accountId: string, orderId: string, orderLinkId: string) {
    this.accountId = accountId;
    this.orderId = orderId;
    this.orderLinkId = orderLinkId;
  }
}
