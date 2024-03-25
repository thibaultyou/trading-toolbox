import { HttpException, HttpStatus } from '@nestjs/common';

export class PositionsUpdateAggregatedException extends HttpException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors
      .map(
        ({ accountId, error }) =>
          `AccountID: ${accountId}, Error: ${error.message}`,
      )
      .join('; ');

    super(
      `Positions - Multiple Updates Failed - Errors: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
