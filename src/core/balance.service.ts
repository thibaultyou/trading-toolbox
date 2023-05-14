import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ExchangeService } from '../exchange/exchange.service';
import { BalanceUpdatedEvent } from './events/balance-updated.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BalanceService implements OnModuleInit {
  private logger = new Logger(BalanceService.name);
  private balance: number;

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
  ) {}

  async onModuleInit() {
    try {
      await this.updateBalance();
      setInterval(async () => {
        await this.updateBalance();
      }, 30000);
    } catch (error) {
      this.logger.error('Error during initialization', error.stack);
    }
  }

  async getBalance(): Promise<number> {
    return this.balance;
  }

  private async updateBalance() {
    try {
      const balance = await this.exchangeService.getBalance();
      this.logger.log(`Updated balance: ${balance}`);
      this.balance = balance;
      this.eventEmitter.emit(
        'balance.updated',
        new BalanceUpdatedEvent(balance),
      );
    } catch (error) {
      this.logger.error('Error updating balance', error.stack);
    }
  }
}
