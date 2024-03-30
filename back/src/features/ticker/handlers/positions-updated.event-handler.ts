import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { PositionsUpdatedEvent } from '../../position/events/positions-updated.event';
import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModulePositionsUpdatedEventHandler {
  private logger = new Logger(TickerModulePositionsUpdatedEventHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.POSITIONS_UPDATED)
  handle(event: PositionsUpdatedEvent) {
    const actionContext = `Event: POSITIONS_UPDATED - AccountID: ${event.accountId}`;

    try {
      this.tickerService.updateTickerPositionsWatchList(
        event.accountId,
        new Set(event.positions.map((p) => p.info.symbol))
      );
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to refresh ticker watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
