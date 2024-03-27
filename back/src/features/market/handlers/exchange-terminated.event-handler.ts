import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { ExchangeTerminatedEvent } from '../../exchange/events/exchange-terminated.event';
import { MarketService } from '../market.service';

@Injectable()
export class MarketModuleExchangeTerminatedEventHandler {
  private logger = new Logger(MarketModuleExchangeTerminatedEventHandler.name);

  constructor(private marketService: MarketService) {}

  @OnEvent(Events.EXCHANGE_TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const actionContext = `Market Module - Event: EXCHANGE_TERMINATED - AccountID: ${event.accountId}`;

    try {
      this.marketService.stopTrackingAccount(event.accountId);
      this.logger.log(`${actionContext} - Removed account from market watch list`);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to remove account from market watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
