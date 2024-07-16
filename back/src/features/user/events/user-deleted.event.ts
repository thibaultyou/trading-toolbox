export class UserDeletedEvent {
  public readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }
}
