import { HttpStatus } from '@nestjs/common';

import { BaseCustomException } from '@common/exceptions/base-custom.exception';

export class BitgetUnsupportedTopicException extends BaseCustomException {
  constructor(topic: string) {
    super('BITGET_UNSUPPORTED_TOPIC', `Unrecognized topic for Bitget | topic=${topic}`, HttpStatus.BAD_REQUEST);
  }
}
