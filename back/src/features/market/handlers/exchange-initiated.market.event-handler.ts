import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { ExchangeInitializedEvent } from '../../exchange/events/exchange-initialized.event';
import { MarketService } from '../market.service';

@Injectable()
export class MarketExchangeInitializedEventHandler {
  private logger = new Logger(MarketExchangeInitializedEventHandler.name);

  constructor(private marketService: MarketService) {}

  @OnEvent(Events.EXCHANGE_INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `Market Module - Event: EXCHANGE_INITIALIZED - AccountID: ${event.accountId}`;

    try {
      await this.marketService.startTrackingAccount(event.accountId);
      this.logger.log(`${actionContext} - Added account to market watch list`);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to market watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
