import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TickerService } from '../ticker/ticker.service';
import { Timers } from '../app.constants';
import { SetupService } from '../setup/setup.service';

@Injectable()
export class CoreService implements OnModuleInit {
  private logger = new Logger(CoreService.name);

  constructor(
    private tickerService: TickerService,
    private setupService: SetupService,
  ) { }

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
      //const setups = await this.setupService.findAll();
      // this.logger.log(setups.filter((setup) => setup.actions));
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
