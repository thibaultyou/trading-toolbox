import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AlertReceivedEvent } from '../../alert/events/alert-received.event';
import { SetupService } from '../setup.service';
import { AppLogger } from '../../logger.service';

@EventsHandler(AlertReceivedEvent)
export class AlertReceivedHandler implements IEventHandler<AlertReceivedEvent> {
  private logger = new AppLogger(AlertReceivedHandler.name);

  constructor(private readonly setupService: SetupService) {}

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
