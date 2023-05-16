import { OnEvent } from '@nestjs/event-emitter';
import { TickerUpdateEvent } from '../events/ticker-update.event';
import { TickerService } from '../ticker.service';
import { Injectable, Logger } from '@nestjs/common';
import { Events } from '../../app.constants';

@Injectable()
export class TickerUpdateHandler {
  private logger = new Logger(TickerUpdateHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent(Events.TICKER_UPDATE)
  handle(event: TickerUpdateEvent) {
    try {
      const symbol = event.topic.split('.')[1];
      this.tickerService.updateTicker(symbol, event.data);
      this.logger.log(`[${Events.TICKER_UPDATE}] ${symbol}`);
    } catch (error) {
      this.logger.error('Error handling TickerUpdateEvent', error.stack);
    }
  }
}
