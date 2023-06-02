import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { Events } from '../../app.constants';
import { SetupCreatedEvent } from '../../setup/events/setup-created.event';
import { TickerService } from '../ticker.service';

@Injectable()
export class SetupCreatedHandler {
  private logger = new Logger(SetupCreatedHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.SETUP_CREATED)
  handle(event: SetupCreatedEvent) {
    try {
      this.tickerService.subscribeTicker(event.setup.ticker);
      this.logger.log(`[${Events.SETUP_CREATED}] [${JSON.stringify(event)}]`);
    } catch (error) {
      this.logger.error('Error handling SetupCreatedEvent', error.stack);
    }
  }
}
