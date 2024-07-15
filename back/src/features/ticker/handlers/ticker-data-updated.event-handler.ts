import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext } from '@config/event-handlers.config';
import { Events } from '@config/events.config';
import { TickerDataUpdatedEvent } from '@core/events/ticker-data-updated.event';

import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModuleTickerUpdatedEventHandler {
  private logger = new Logger(EventHandlersContext.TickerModuleEventHandler);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.TICKER_DATA_UPDATED)
  handle(event: TickerDataUpdatedEvent) {
    const actionContext = `${Events.TICKER_DATA_UPDATED} | AccountID: ${event.accountId}`;

    try {
      this.tickerService.updateTickerData(event.accountId, event.marketId, event.data);
      this.logger.debug(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to update ticker data - Error: ${error.message}`, error.stack);
    }
  }
}
