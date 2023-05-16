import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { Events } from '../../app.constants';
import { SetupCreatedEvent } from '../../setup/events/setup-created.event';
import { ExchangeService } from '../exchange.service';

@Injectable()
export class SetupCreatedHandler {
  private logger = new Logger(SetupCreatedHandler.name);

  constructor(private exchangeService: ExchangeService) {}

  @OnEvent(Events.SETUP_CREATED)
  handle(event: SetupCreatedEvent) {
    try {
      this.exchangeService.subscribeTicker(event.setup.ticker);
      this.logger.error(`[${Events.SETUP_CREATED}] [${JSON.stringify(event)}]`);
    } catch (error) {
      this.logger.error('Error handling SetupCreatedEvent', error.stack);
    }
  }
}
