export class UserUpdatedEvent {
  public readonly userId: string;

  public readonly username: string;

  constructor(userId: string, username: string) {
    this.userId = userId;
    this.username = username;
  }
}
