import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { CORRELATION_ID_HEADER } from '@config';

export const CorrelationId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.headers[CORRELATION_ID_HEADER] || req.correlationId;
});
