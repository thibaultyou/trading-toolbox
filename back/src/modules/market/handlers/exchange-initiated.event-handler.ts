import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';
import { ExchangeInitializedEvent } from '@exchange/events/exchange-initialized.event';

import { MarketService } from '../market.service';

@Injectable()
export class MarketModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.MarketModule);

  constructor(private marketService: MarketService) {}

  @OnEvent(Events.Exchange.INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    this.logger.debug(`handle() - start | event=${Events.Exchange.INITIALIZED}, accountId=${event.accountId}`);

    try {
      await this.marketService.startTrackingAccount(event.accountId);
      this.logger.log(`handle() - success | event=${Events.Exchange.INITIALIZED}, accountId=${event.accountId}`);
    } catch (error) {
      this.logger.error(
        `handle() - error | event=${Events.Exchange.INITIALIZED}, accountId=${event.accountId}, msg=${error.message}`,
        error.stack
      );
    }
  }
}
