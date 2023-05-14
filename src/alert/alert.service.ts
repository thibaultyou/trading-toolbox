import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlertReceivedEvent } from './events/alert-received.event';
@Injectable()
export class AlertService {
  private logger = new Logger(AlertService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  notify(test: string): void {
    try {
      this.logger.log(`Notifying alert with test: ${test}`);
      this.eventEmitter.emit('alert.received', new AlertReceivedEvent(test));
    } catch (error) {
      this.logger.error(
        `Error notifying alert with test: ${test}`,
        error.stack,
      );
    }
  }
}
