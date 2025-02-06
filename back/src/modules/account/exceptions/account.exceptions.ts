import { HttpStatus } from '@nestjs/common';

import { BaseCustomException } from '@common/exceptions/base-custom.exception';

import { maskString } from '../account.utils';

export class AccountNotFoundException extends BaseCustomException {
  constructor(identifier: string, isName = false) {
    const fieldName = isName ? 'name' : 'accountId';
    super('ACCOUNT_NOT_FOUND', `Account not found | ${fieldName}=${identifier}`, HttpStatus.NOT_FOUND);
  }
}

export class AccountAlreadyExistsException extends BaseCustomException {
  constructor(accountName: string, key: string) {
    super(
      'ACCOUNT_ALREADY_EXISTS',
      `Account already exists | name=${accountName}, key=${maskString(key)}`,
      HttpStatus.CONFLICT
    );
  }
}
