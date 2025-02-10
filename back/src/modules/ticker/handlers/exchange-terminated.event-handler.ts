import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';
import { ExchangeTerminatedEvent } from '@exchange/events/exchange-terminated.event';

import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModuleExchangeTerminatedEventHandler {
  private readonly logger = new Logger(EventHandlersContext.TickerModule);

  constructor(private readonly tickerService: TickerService) {}

  @OnEvent(Events.Exchange.TERMINATED)
  handle(event: ExchangeTerminatedEvent) {
    const accountId = event.accountId;
    const actionContext = `${Events.Exchange.TERMINATED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      this.tickerService.stopTrackingAccount(accountId);
      this.logger.log(`handle() - success | ${actionContext}, tracking=stopped`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
