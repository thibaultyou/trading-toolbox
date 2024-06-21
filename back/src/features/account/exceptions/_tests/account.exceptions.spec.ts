import { HttpStatus } from '@nestjs/common';

import { maskString } from '../../../../common/utils/string.util';
import { AccountAlreadyExistsException, AccountNotFoundException } from '../account.exceptions';

describe('Account Exceptions', () => {
  describe('AccountNotFoundException', () => {
    it('should create an exception with the correct message and status for ID', () => {
      const identifier = '123';
      const exception = new AccountNotFoundException(identifier);
      expect(exception.message).toEqual(`Account not found - ID: ${identifier}`);
      expect(exception.getStatus()).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should create an exception with the correct message and status for name', () => {
      const identifier = 'testName';
      const exception = new AccountNotFoundException(identifier, true);
      expect(exception.message).toEqual(`Account not found - Name: ${identifier}`);
      expect(exception.getStatus()).toEqual(HttpStatus.NOT_FOUND);
    });
  });

  describe('AccountAlreadyExistsException', () => {
    it('should create an exception with the correct message and status', () => {
      const accountName = 'testAccount';
      const key = 'testKey';
      const exception = new AccountAlreadyExistsException(accountName, key);
      expect(exception.message).toEqual(`Account already exists - Name: ${accountName}, Key: ${maskString(key)}`);
      expect(exception.getStatus()).toEqual(HttpStatus.CONFLICT);
    });
  });
});
