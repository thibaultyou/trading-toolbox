import { OnEvent } from '@nestjs/event-emitter';
import { AlertReceivedEvent } from '../../alert/events/alert-received.event';
import { SetupService } from '../setup.service';
import { Injectable, Logger } from '@nestjs/common';
import { Events } from '../../app.constants';

@Injectable()
export class AlertReceivedHandler {
  private logger = new Logger(AlertReceivedHandler.name);

  constructor(private readonly setupService: SetupService) {}

  @OnEvent(Events.ALERT_RECEIVED)
  async handle(event: AlertReceivedEvent) {
    this.logger.log(`Alert received: ${JSON.stringify(event)}`);
    try {
      const setup = await this.setupService.create(event.setup);
      this.logger.log(`[${Events.ALERT_RECEIVED}] ${setup.ticker}`);
    } catch (error) {
      this.logger.error(`Error while creating setup: ${error.message}`);
    }
  }
}
