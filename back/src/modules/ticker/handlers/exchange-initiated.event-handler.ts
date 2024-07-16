import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';
import { ExchangeInitializedEvent } from '@exchange/events/exchange-initialized.event';

import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.TickerModule);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.Exchange.INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const actionContext = `${Events.Exchange.INITIALIZED} | AccountID: ${event.accountId}`;

    try {
      await this.tickerService.startTrackingAccount(event.accountId);
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to add account to ticker watch list - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
