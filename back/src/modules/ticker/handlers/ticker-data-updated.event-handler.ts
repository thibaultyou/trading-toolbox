import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ConfigService, Events } from '@config';
import { TickerDataUpdatedEvent } from '@exchange/events/ticker-data-updated.event';
import { ExchangeEventThrottleService } from '@exchange/services/event-throttle.service';

import { TickerService } from '../ticker.service';

@Injectable()
export class TickerModuleTickerUpdatedEventHandler {
  private readonly logger = new Logger(this.configService.handlers.TickerModule);

  constructor(
    private readonly tickerService: TickerService,
    private readonly throttleService: ExchangeEventThrottleService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Data.TICKER_UPDATED)
  handle(event: TickerDataUpdatedEvent) {
    // NOTE Avoiding logs here to prevent high frequency noise
    const { accountId, marketId } = event;
    const actionContext = `${Events.Data.TICKER_UPDATED} | accountId=${accountId}`;
    // this.logger.debug(`handle() - start | ${actionContext}`);
    const key = `ticker::${accountId}::${marketId}`;

    if (!this.throttleService.canProcess(key, this.configService.timers.THROTTLE_WINDOW_MS)) {
      // this.logger.debug(`handle() - skip (throttled) | ${actionContext}`);
      return;
    }

    try {
      this.tickerService.updateTickerData(accountId, marketId, event.data);
      // this.logger.log(`handle() - success | ${actionContext}, marketId=${marketId}`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
