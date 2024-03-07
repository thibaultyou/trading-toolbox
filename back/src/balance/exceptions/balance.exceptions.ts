import { HttpException, HttpStatus } from '@nestjs/common';

export class FetchAccountBalanceException extends HttpException {
  constructor(accountName: string, error: any) {
    super(
      `Error fetching balance for account ${accountName}: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
