import { OnEvent } from '@nestjs/event-emitter';
import { TickerUpdateEvent } from '../events/ticker-update.event';
import { TickerService } from '../ticker.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TickerUpdateHandler {
  private logger = new Logger(TickerUpdateHandler.name);

  constructor(private tickerService: TickerService) {}

  @OnEvent('ticker.update')
  handle(event: TickerUpdateEvent) {
    try {
      const symbol = event.topic.split('.')[1]; // Extract symbol from topic (e.g., 'tickers.BTCUSDT')
      this.tickerService.updateTicker(symbol, event.data);
      this.logger.log(`Ticker updated: ${symbol}`);
    } catch (error) {
      this.logger.error('Error handling TickerUpdateEvent', error.stack);
    }
  }
}
