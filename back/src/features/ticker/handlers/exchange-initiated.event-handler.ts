import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext } from '@config/event-handlers.config';
import { Events } from '@config/events.config';
import { ExchangeInitializedEvent } from '@exchange/events/exchange-initialized.event';

import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.TickerModuleEventHandler);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.EXCHANGE_INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `${Events.EXCHANGE_INITIALIZED} | AccountID: ${event.accountId}`;

    try {
      await this.tickerService.startTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to ticker watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
