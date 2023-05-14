import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class DataService implements OnModuleInit {
  private tradingIntervalId: NodeJS.Timeout;
  private equity: number;
  private logger: Logger = new Logger(DataService.name);

  constructor(private exchangeService: ExchangeService) {}

  async onModuleInit() {
    try {
      await this.updateEquity();
      this.tradingIntervalId = setInterval(async () => {
        await this.updateEquity();
      }, 30000);

      this.tradingIntervalId = setInterval(async () => {
        await this.tradeLoop();
      }, 2000);
    } catch (error) {
      this.logger.error('Error during initialization', error.stack);
    }
  }

  private async updateEquity() {
    try {
      this.equity = await this.exchangeService.getEquity();
      this.logger.log(`Updated Equity: ${this.equity}`);
    } catch (error) {
      this.logger.error('Error updating equity', error.stack);
    }
  }

  private async tradeLoop() {
    try {
      const openPositions = await this.exchangeService.getOpenPositions();
      this.logger.log(
        `Updated Open Positions: ${JSON.stringify(openPositions)}`,
      );
    } catch (error) {
      this.logger.error('Error during trade loop', error.stack);
    }
  }
}
