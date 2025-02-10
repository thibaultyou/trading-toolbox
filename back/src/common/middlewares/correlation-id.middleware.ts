import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { asyncLocalStorage } from '@common/async-context';
import { CORRELATION_ID_HEADER } from '@config';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let correlationId = req.headers[CORRELATION_ID_HEADER] as string;

    if (!correlationId) {
      correlationId = uuidv4();
    }

    req.headers[CORRELATION_ID_HEADER] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    asyncLocalStorage.run({ correlationId }, () => {
      (req as any).correlationId = correlationId;
      next();
    });
  }
}
