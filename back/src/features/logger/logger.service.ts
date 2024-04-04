import { Injectable, Scope } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

import { ILogger } from './logger.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger {
  private logger: ILogger & { setContext: (context: string) => void };
  private currentContext = '';

  constructor() {
    this.logger = this.createAppLogger();
  }

  private createAppLogger(): ILogger & { setContext: (context: string) => void } {
    const logger = createLogger({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY/MM/DD, HH:mm:ss' }),
        format.printf((info) => `${info.timestamp}   ${info.level}   [${this.currentContext}] ${info.message}`)
      ),
      transports: [new transports.Console()]
    });

    return {
      setContext: (context: string) => {
        this.currentContext = context;
      },
      debug: (msg: string) => () => logger.debug(msg),
      error: (msg: string, err?: Error) => () => logger.error(msg, { error: err }),
      info: (msg: string) => () => logger.info(msg),
      warn: (msg: string) => () => logger.warn(msg)
    };
  }

  setContext(context: string) {
    this.logger.setContext(context);
  }

  debug(message: string) {
    this.logger.debug(message)();
  }

  error(message: string, error?: Error) {
    this.logger.error(message, error)();
  }

  info(message: string) {
    this.logger.info(message)();
  }

  warn(message: string) {
    this.logger.warn(message)();
  }
}
