import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { Timers } from '../app.constants';
import { IExchangeService } from '../exchange/exchange.interfaces';
import { ExchangeService } from '../exchange/exchange.service';
import { TickerService } from '../ticker/ticker.service';

@Injectable()
export class GridService implements OnModuleInit {
  private logger = new Logger(GridService.name);

  constructor(
    private tickerService: TickerService,
    private exchangeService: ExchangeService,
  ) {}

  async onModuleInit() {
    try {
      setInterval(async () => {
        await this.tradeLoop();
      }, Timers.TRADE_LOOP_COOLDOWN);
    } catch (error) {
      this.logger.error('Error during initialization', error.stack);
    }
  }

  private async tradeLoop() {
    try {
      console.log('Grid loop');
    } catch (error) {
      this.logger.error('Error during trade loop', error.stack);
    }
  }
}
