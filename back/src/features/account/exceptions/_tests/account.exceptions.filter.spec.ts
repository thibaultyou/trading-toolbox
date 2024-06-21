import { HttpStatus } from '@nestjs/common';

import { maskString } from '../../../../common/utils/string.util';
import { AccountAlreadyExistsException, AccountNotFoundException } from '../account.exceptions';
import { AccountExceptionsFilter } from '../account.exceptions.filter';

describe('AccountExceptionsFilter', () => {
  let filter: AccountExceptionsFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string };
  beforeEach(() => {
    filter = new AccountExceptionsFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockRequest = { url: '' };
  });

  const executeFilterCatch = (exception: AccountNotFoundException | AccountAlreadyExistsException, url: string) => {
    mockRequest.url = url;

    filter.catch(exception, {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest
      })
    } as any);
  };
  it('should format the response correctly for an AccountNotFoundException', () => {
    const exception = new AccountNotFoundException('123');
    executeFilterCatch(exception, '/test-url');

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      timestamp: expect.any(String),
      path: '/test-url',
      message: 'Account not found - ID: 123'
    });
  });

  it('should format the response correctly for an AccountAlreadyExistsException', () => {
    const accountName = 'duplicateAccount';
    const key = 'duplicateKey';
    const exception = new AccountAlreadyExistsException(accountName, key);
    executeFilterCatch(exception, '/accounts');

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      timestamp: expect.any(String),
      path: '/accounts',
      message: `Account already exists - Name: ${accountName}, Key: ${maskString(key)}`
    });
  });
});
