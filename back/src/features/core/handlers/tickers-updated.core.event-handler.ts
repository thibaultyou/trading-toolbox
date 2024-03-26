import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { TickersUpdatedEvent } from '../../../features/ticker/events/tickers-updated.event';
import { WebsocketManagerService } from '../services/websocket-manager.service';

@Injectable()
export class CoreTickersUpdatedEventHandler {
  private logger = new Logger(CoreTickersUpdatedEventHandler.name);

  constructor(private websocketManagerService: WebsocketManagerService) {}

  @OnEvent(Events.TICKERS_UPDATED)
  async handle(event: TickersUpdatedEvent) {
    const actionContext = `Core Module - Event: TICKERS_UPDATED - AccountID: ${event.accountId}`;

    try {
      await this.websocketManagerService.subscribe(
        event.accountId,
        event.marketIds.map((id) => `tickers.${id}`)
      );
      this.logger.log(`${actionContext} - Updated websocket subscriptions`);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to update websocket subscriptions - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
