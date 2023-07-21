import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AccountService } from '../account/account.service';
import { Timers, Events } from '../app.constants';
import { ExchangeService } from '../exchange/exchange.service';

import { BalanceUpdatedEvent } from './events/balance-updated.event';

@Injectable()
export class BalanceService implements OnModuleInit {
  private logger = new Logger(BalanceService.name);
  private balances: Map<string, number> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private accountService: AccountService,
  ) {}

  async onModuleInit() {
    this.updateBalances();
  }

  async getBalance(accountName: string): Promise<number> {
    return this.balances.get(accountName);
  }

  private async updateBalances() {
    const accounts = await this.accountService.findAll();
    for (const account of accounts) {
      try {
        const balance = await this.exchangeService.getBalance(account.name);
        if (balance !== undefined) {
          const parsedBalance = parseFloat(balance.toFixed(2));
          this.logger.log(
            `Updated balance for ${account.name}: ${parsedBalance}$`,
          );
          this.balances.set(account.name, parsedBalance);
          this.eventEmitter.emit(
            Events.BALANCE_UPDATED,
            new BalanceUpdatedEvent(account.name, parsedBalance),
          );
        } else {
          this.logger.warn(
            `Could not retrieve balance for ${account.name} from exchange service`,
          );
        }
        // Sleep for BALANCE_UPDATE_COOLDOWN ms between each request.
        await new Promise((resolve) =>
          setTimeout(resolve, Timers.BALANCE_UPDATE_COOLDOWN),
        );
      } catch (error) {
        this.logger.error(
          `Error updating balance for ${account.name}`,
          error.stack,
        );
      }
    }
    // Recall the function after all balances are updated.
    setTimeout(() => this.updateBalances(), Timers.BALANCE_UPDATE_COOLDOWN);
  }
}
