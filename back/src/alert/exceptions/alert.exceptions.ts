import { HttpException, HttpStatus } from '@nestjs/common';

export class AlertReceiveException extends HttpException {
  constructor(error: string) {
    super(`Error receiving alert: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
