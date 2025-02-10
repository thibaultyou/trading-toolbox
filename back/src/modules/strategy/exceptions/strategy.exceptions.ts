import { HttpStatus } from '@nestjs/common';

import { BaseCustomException } from '@common/exceptions/base-custom.exception';

export class StrategyNotFoundException extends BaseCustomException {
  constructor(strategyId: string) {
    super('STRATEGY_NOT_FOUND', `Strategy not found | strategyId=${strategyId}`, HttpStatus.NOT_FOUND);
  }
}

export class UnknownStrategyTypeException extends BaseCustomException {
  constructor(type: string) {
    super('UNKNOWN_STRATEGY_TYPE', `Unknown strategy type | type=${type}`, HttpStatus.BAD_REQUEST);
  }
}
