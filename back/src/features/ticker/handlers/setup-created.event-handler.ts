import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { SetupCreatedEvent } from '../../../_setup/events/setup-created.event';
import { Events } from '../../../config';
import { TickerService } from '../ticker.service';

@Injectable()
export class SetupCreatedHandler {
  private logger = new Logger(SetupCreatedHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.SETUP_CREATED)
  handle(event: SetupCreatedEvent) {
    try {
      this.tickerService.subscribeToTickerPrice(
        event.setup.account,
        event.setup.market,
      );
      this.logger.log(`[${Events.SETUP_CREATED}] [${JSON.stringify(event)}]`);
    } catch (error) {
      this.logger.error('Error handling SetupCreatedEvent', error.stack);
    }
  }
}
