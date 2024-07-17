export class TrackingFailedException extends Error {
  constructor(accountId: string, error: any) {
    super(`Tracking Failed - AccountID: ${accountId} - Error: ${error.message}`);
    this.name = this.constructor.name;
  }
}
