import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TickerService } from './ticker.service';
import { Timers } from '../app.constants';

@Injectable()
export class CoreService implements OnModuleInit {
  private logger = new Logger(CoreService.name);

  constructor(private tickerService: TickerService) {}

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
      // const openPositions = await this.positionService.getPositions();
      // this.logger.log(
      //   `Updated Open Positions: ${JSON.stringify(openPositions)}`,
      // );
      // const tickers = this.tickerService.getTickers();
      // this.logger.log(tickers);
    } catch (error) {
      this.logger.error('Error during trade loop', error.stack);
    }
  }
}
