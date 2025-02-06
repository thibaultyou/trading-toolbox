import { HttpStatus } from '@nestjs/common';

import { BaseCustomException } from '@common/exceptions/base-custom.exception';

export class PositionNotFoundException extends BaseCustomException {
  constructor(accountId: string, marketId: string) {
    super(
      'POSITION_NOT_FOUND',
      `Position not found | accountId=${accountId}, marketId=${marketId}`,
      HttpStatus.NOT_FOUND
    );
  }
}

export class PositionsUpdateAggregatedException extends BaseCustomException {
  constructor(errors: Array<{ accountId: string; error: Error }>) {
    const message = errors.map(({ accountId, error }) => `accountId=${accountId}, msg=${error.message}`).join('; ');
    super(
      'POSITIONS_UPDATE_FAILED',
      `Multiple position updates failed | errors=[${message}]`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
