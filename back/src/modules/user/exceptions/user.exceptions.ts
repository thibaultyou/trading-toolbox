import { HttpStatus } from '@nestjs/common';

import { BaseCustomException } from '@common/exceptions/base-custom.exception';

export class UserAlreadyExistsException extends BaseCustomException {
  constructor(username: string) {
    super('USER_ALREADY_EXISTS', `User already exists | username=${username}`, HttpStatus.CONFLICT);
  }
}

export class UserNotFoundException extends BaseCustomException {
  constructor(userId: string) {
    super('USER_NOT_FOUND', `User not found | userId=${userId}`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidUserCredentialsException extends BaseCustomException {
  constructor(username: string) {
    super('INVALID_USER_CREDENTIALS', `Invalid credentials | username=${username}`, HttpStatus.UNAUTHORIZED);
  }
}

export class UserPasswordOperationException extends BaseCustomException {
  constructor(action: string, msg: string) {
    super(
      'USER_PASSWORD_OPERATION_FAILED',
      `Password operation failed | action=${action}, msg=${msg}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class UserOperationFailedException extends BaseCustomException {
  constructor(action: string, msg: string) {
    super(
      'USER_OPERATION_FAILED',
      `User operation failed | action=${action}, msg=${msg}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
