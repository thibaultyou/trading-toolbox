import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class TickerService implements OnModuleInit {
  private tickers: Record<string, number> = {};
  private logger = new Logger(TickerService.name);

  constructor(private exchangeService: ExchangeService) {}

  async onModuleInit() {
    try {
      const symbols = ['BTCUSDT'];
      symbols.forEach((symbol) => this.exchangeService.subscribeTicker(symbol));
    } catch (error) {
      this.logger.error('Error during module initialization', error.stack);
    }
  }

  updateTicker(symbol: string, data: any): void {
    try {
      const price = (Number(data.ask1Price) + Number(data.bid1Price)) / 2;
      if (this.tickers[symbol] !== price) {
        this.tickers[symbol] = price;
        this.logger.log(`Updated ticker for ${symbol} ${price}`);
      }
    } catch (error) {
      this.logger.error('Error during ticker update', error.stack);
    }
  }

  getTicker(symbol: string): number {
    return this.tickers[symbol];
  }

  getTickers(): Record<string, number> {
    return this.tickers;
  }
}
