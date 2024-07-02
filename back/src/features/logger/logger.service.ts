import { LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

import { InjectConfig } from '../../common/decorators/inject-env.decorator';
import { Config } from '../../config/env.config';
import { ILogger } from './logger.interface';

export class AppLogger implements LoggerService {
  private logger: ILogger & { setContext: (context: string) => void };
  private context = '';

  constructor(
    @InjectConfig() private config: Config,
    context?: string
  ) {
    this.context = context;
    this.logger = this.createAppLogger();
  }

  private createAppLogger(): ILogger & { setContext: (context: string) => void } {
    const logger = createLogger({
      level: this.config.NODE_ENV === 'development' ? 'debug' : 'info',
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY/MM/DD,HH:mm:ss' }),
        format.printf((info) => {
          const ctx = this.context ? `[${this.context}]` : '';
          return `${info.timestamp} [${info.level}]${ctx} | ${info.message}`;
        })
      ),
      transports: [new transports.Console()]
    });
    return {
      setContext: (context: string) => {
        this.context = context;
      },
      debug: (msg: string) => () => logger.debug(msg),
      error: (msg: string, trace?: string) => () => logger.error(msg, { error: trace }),
      log: (msg: string) => () => logger.info(msg),
      warn: (msg: string) => () => logger.warn(msg),
      fatal: (msg: string) => () => logger.emerg(msg),
      verbose: (msg: string) => () => logger.verbose(msg)
    };
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.setContext(context);
    this.logger.log(message)();
  }

  error(message: any, trace?: string, context?: string) {
    this.setContext(context);
    this.logger.error(message, trace)();
  }

  warn(message: any, context?: string) {
    this.setContext(context);
    this.logger.warn(message)();
  }

  debug(message: any, context?: string) {
    this.setContext(context);
    this.logger.debug(message)();
  }

  verbose(message: any, context?: string) {
    this.setContext(context);
    this.logger.verbose(message)();
  }

  fatal(message: any, context?: string) {
    this.setContext(context);
    this.logger.fatal(message)();
  }
}
