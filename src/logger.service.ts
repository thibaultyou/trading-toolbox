import {
  Injectable,
  Scope,
  LoggerService,
  ConsoleLogger,
} from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger implements LoggerService {
  log(message: any, context?: string) {
    super.log(
      message,
      `${this.getCurrentTimestamp()} ${this.formatLogMessage(context)}`,
    );
  }

  error(message: any, trace?: string, context?: string) {
    super.error(
      message,
      trace,
      `${this.getCurrentTimestamp()} ${this.formatLogMessage(context)}`,
    );
  }

  warn(message: any, context?: string) {
    super.warn(
      message,
      `${this.getCurrentTimestamp()} ${this.formatLogMessage(context)}`,
    );
  }

  debug(message: any, context?: string) {
    super.debug(
      message,
      `${this.getCurrentTimestamp()} ${this.formatLogMessage(context)}`,
    );
  }

  verbose(message: any, context?: string) {
    super.verbose(
      message,
      `${this.getCurrentTimestamp()} ${this.formatLogMessage(context)}`,
    );
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLogMessage(context: string): string {
    try {
      const parsed = JSON.parse(context);
      if (typeof parsed === 'object') {
        return JSON.stringify(parsed, null, 2);
      }
    } catch (e) {
      // context is not JSON
    }
    return context;
  }
}
