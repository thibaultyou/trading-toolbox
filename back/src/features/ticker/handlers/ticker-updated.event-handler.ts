import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { TickerUpdatedEvent } from '../events/ticker-updated.event';
import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModuleTickerUpdatedEventHandler {
  private logger = new Logger(TickerModuleTickerUpdatedEventHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.TICKER_UPDATED)
  handle(event: TickerUpdatedEvent) {
    const actionContext = `Ticker Module - Event: TICKER_UPDATED - AccountID: ${event.accountId}`;

    try {
      this.tickerService.updateTickerValue(event.accountId, event.marketId, event.price);
      this.logger.debug(`${actionContext}, MarketID: ${event.marketId}, Price: ${event.price} - Updated ticker price`);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to update ticker watch list - Error: ${error.message}`, error.stack);
    }
  }
}
