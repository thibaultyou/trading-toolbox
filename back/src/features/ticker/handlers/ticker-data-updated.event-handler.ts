import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { TickerDataUpdatedEvent } from '../events/ticker-data-updated.event';
import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModuleTickerUpdatedEventHandler {
  private logger = new Logger(TickerModuleTickerUpdatedEventHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.TICKER_DATA_UPDATED)
  handle(event: TickerDataUpdatedEvent) {
    const actionContext = `Event: TICKER_DATA_UPDATED - AccountID: ${event.accountId}`;

    try {
      this.tickerService.updateTickerData(event.accountId, event.marketId, event.data);
      this.logger.debug(actionContext);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to update ticker data - Error: ${error.message}`, error.stack);
    }
  }
}
