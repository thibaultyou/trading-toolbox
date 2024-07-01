import { HttpException, HttpStatus } from '@nestjs/common';

export class StrategyNotFoundException extends HttpException {
  constructor(identifier: string) {
    super(`Strategy not found - StrategyID: ${identifier}`, HttpStatus.NOT_FOUND);
  }
}
