import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExchangeService } from '../exchange/exchange.service';
import { SetupService } from '../setup/setup.service';

@Injectable()
export class TickerService implements OnModuleInit {
  private tickers: Record<string, number> = {};
  private logger = new Logger(TickerService.name);

  constructor(
    private exchangeService: ExchangeService,
    private setupService: SetupService,
  ) {}

  async onModuleInit() {
    try {
      const setups = await this.setupService.findAll();
      const symbols = [...new Set(setups.map((setup) => setup.ticker))];
      symbols.forEach((symbol) => this.subscribeTicker(symbol));
    } catch (error) {
      this.logger.error('Error during module initialization', error.stack);
    }
  }

  subscribeTicker(symbol: string): void {
    try {
      this.exchangeService.performWsAction(
        'subscribe',
        `tickers.${symbol}`,
        'subscribing to ticker',
      );
    } catch (error) {
      this.logger.error(`Error subscribing to ticker ${symbol}`, error.stack);
    }
  }

  unsubscribeTicker(symbol: string): void {
    try {
      this.exchangeService.performWsAction(
        'unsubscribe',
        `tickers.${symbol}`,
        'unsubscribing from ticker',
      );
    } catch (error) {
      this.logger.error(
        `Error unsubscribing from ticker ${symbol}`,
        error.stack,
      );
    }
  }

  updateTicker(symbol: string, data: any): void {
    try {
      const price = (Number(data.ask1Price) + Number(data.bid1Price)) / 2;
      if (this.tickers[symbol] !== price) {
        this.tickers[symbol] = price;
        this.logger.debug(`Updated ticker for ${symbol} ${price}`);
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
