import { HttpException } from '@nestjs/common';

export class BaseCustomException extends HttpException {
  public readonly errorCode: string;
  constructor(errorCode: string, message: string, status: number) {
    super({ errorCode, message }, status);
    this.errorCode = errorCode;
  }
}
