import { HttpException, HttpStatus } from '@nestjs/common';

import { maskString } from '../../../utils/string.util';

export class AccountNotFoundException extends HttpException {
  constructor(identifier: string, isName = false) {
    super(
      `Account not found - ${isName ? 'Name' : 'ID'}: ${identifier}`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class AccountAlreadyExistsException extends HttpException {
  constructor(accountName: string, key: string) {
    super(
      `Account already exists - Name: ${accountName}, Key: ${maskString(key)}`,
      HttpStatus.CONFLICT,
    );
  }
}
