import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Timers, Events } from '../app.constants';
import { ExchangeService } from '../exchange/exchange.service';
import { BalanceUpdatedEvent } from './events/balance-updated.event';

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
      }, Timers.BALANCE_UPDATE_COOLDOWN);
    } catch (error) {
      this.logger.error('Error during initialization', error.stack);
    }
  }

  async getBalance(): Promise<number> {
    return this.balance;
  }

  private async updateBalance() {
    try {
      let balance = await this.exchangeService.getBalance();
      if (balance !== undefined) {
        balance = parseFloat(balance.toFixed(2));
        this.logger.log(`Updated balance: ${balance}$`);
        this.balance = balance;
        this.eventEmitter.emit(
          Events.BALANCE_UPDATED,
          new BalanceUpdatedEvent(balance),
        );
      } else {
        this.logger.warn('Could not retrieve balance from exchange service');
      }
    } catch (error) {
      this.logger.error('Error updating balance', error.stack);
    }
  }
}
