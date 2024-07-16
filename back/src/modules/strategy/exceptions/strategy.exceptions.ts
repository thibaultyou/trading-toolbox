import { HttpException, HttpStatus } from '@nestjs/common';

export class StrategyNotFoundException extends HttpException {
  constructor(identifier: string) {
    super(`Strategy not found - StrategyID: ${identifier}`, HttpStatus.NOT_FOUND);
  }
}

export class UnknownStrategyTypeException extends HttpException {
  constructor(type: string) {
    super(`Unknown strategy type: ${type}`, HttpStatus.BAD_REQUEST);
  }
}
