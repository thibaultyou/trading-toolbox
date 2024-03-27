import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { ExchangeTerminatedEvent } from '../../exchange/events/exchange-terminated.event';
import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModuleExchangeTerminatedEventHandler {
  private logger = new Logger(TickerModuleExchangeTerminatedEventHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.EXCHANGE_TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const actionContext = `Ticker Module - Event: EXCHANGE_TERMINATED - AccountID: ${event.accountId}`;

    try {
      this.tickerService.stopTrackingAccount(event.accountId);
      this.logger.log(`${actionContext} - Removed account from ticker watch list`);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from ticker watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
