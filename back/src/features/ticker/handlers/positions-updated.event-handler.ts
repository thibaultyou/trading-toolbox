import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { PositionsUpdatedEvent } from '../../position/events/positions-updated.event';
import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModulePositionsUpdatedEventHandler {
  private logger = new Logger(EventHandlersContext.TickerModuleEventHandler);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.POSITIONS_UPDATED)
  async handle(event: PositionsUpdatedEvent) {
    const actionContext = `${Events.POSITIONS_UPDATED} | AccountID: ${event.accountId}`;

    try {
      await this.tickerService.updateTickerPositionsWatchList(
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
