import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { PositionsUpdatedEvent } from '../../position/events/positions-updated.event';
import { TickerService } from '../ticker.service';

@Injectable()
export class TickerPositionsUpdatedEventHandler {
  private logger = new Logger(TickerPositionsUpdatedEventHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.POSITIONS_UPDATED)
  handle(event: PositionsUpdatedEvent) {
    const actionContext = `Ticker Module - Event: POSITIONS_UPDATED - AccountID: ${event.accountId}`;

    try {
      this.tickerService.updateTickerPositionsWatchList(
        event.accountId,
        event.positions.map((p) => p.symbol)
      );
      this.logger.log(`${actionContext} - Updated ticker watch list`);
    } catch (error) {
      this.logger.error(`${actionContext} - Failed to update ticker watch list - Error: ${error.message}`, error.stack);
    }
  }
}
