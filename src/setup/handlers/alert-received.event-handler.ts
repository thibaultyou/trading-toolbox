import { OnEvent } from '@nestjs/event-emitter';
import { AlertReceivedEvent } from '../../alert/events/alert-received.event';
import { SetupService } from '../setup.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AlertReceivedHandler {
  private logger = new Logger(AlertReceivedHandler.name);

  constructor(private readonly setupService: SetupService) {}

  @OnEvent('alert.received')
  async handle(event: AlertReceivedEvent) {
    this.logger.log(`Alert received: ${JSON.stringify(event)}`);
    try {
      const setup = await this.setupService.create(event.test);
      this.logger.log(`Setup created: ${setup.id}`);
    } catch (error) {
      this.logger.error(`Error while creating setup: ${error.message}`);
    }
  }
}
