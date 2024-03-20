import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../../config';
import { UpdateTickerEvent } from '../../../features/exchange/events/update-ticker.event';
import { TickerService } from '../ticker.service';

@Injectable()
export class TickerUpdateHandler {
  private logger = new Logger(TickerUpdateHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.UPDATE_TICKER)
  handle(event: UpdateTickerEvent) {
    try {
      const symbol = event.topic.split('.')[1];
      this.tickerService.updateTickerPrice(
        event.accountName,
        symbol,
        event.data,
      );
      this.logger.debug(
        `[${Events.UPDATE_TICKER}] ${symbol} ${JSON.stringify(event.data)}`,
      );
    } catch (error) {
      this.logger.error('Error handling UpdateTickerEvent', error.stack);
    }
  }
}
