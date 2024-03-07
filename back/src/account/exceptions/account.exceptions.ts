import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountNotFoundException extends HttpException {
  constructor(identifier: string, isName: boolean = false) {
    super(
      `Account with ${isName ? 'name' : 'id'}: ${identifier} not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class AccountAlreadyExistsException extends HttpException {
  constructor(name: string, key: string) {
    super(
      `Account with name: ${name} or key: ${key} already exists`,
      HttpStatus.CONFLICT,
    );
  }
}

export class AccountCreateException extends HttpException {
  constructor(name: string, error: string) {
    super(
      `Error creating account with name: ${name}: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
