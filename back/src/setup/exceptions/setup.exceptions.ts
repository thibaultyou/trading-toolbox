import { HttpException, HttpStatus } from '@nestjs/common';

export class SetupNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Setup with id: ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class SetupCreateException extends HttpException {
  constructor(ticker: string, error: string) {
    super(
      `Error creating setup with ticker: ${ticker}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class SetupUpdateException extends HttpException {
  constructor(id: string, error: string) {
    super(
      `Error updating setup with id: ${id}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class SetupDeleteException extends HttpException {
  constructor(id: string, error: string) {
    super(
      `Error deleting setup with id: ${id}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class SetupFetchAllException extends HttpException {
  constructor(error: string) {
    super(
      `Error fetching all setups: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class SetupCreateFromAlertException extends HttpException {
  constructor(error: string) {
    super(
      `Error while creating setup from alert: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
