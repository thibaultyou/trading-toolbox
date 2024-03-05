import { Injectable, Logger } from '@nestjs/common';

import { AccountService } from '../account/account.service';
import { Timers } from '../app.constants';
import { ExchangeService } from '../exchange/exchange.service';
import { BalanceGateway } from './balance.gateway';

@Injectable()
export class BalanceService {
  private logger = new Logger(BalanceService.name);
  private balances: Map<string, number> = new Map();

  constructor(
    private exchangeService: ExchangeService,
    private accountService: AccountService,
    private balanceGateway: BalanceGateway,
  ) {}

  async onModuleInit() {
    this.updateBalances();
  }

  getBalances(): Record<string, number> {
    return Object.fromEntries(this.balances);
  }

  getAccountBalance(accountName: string): number {
    return this.balances.get(accountName);
  }

  // from Websocket
  updateBalance(accountName: string, balance: number): void {
    this.balances.set(accountName, balance);
    this.balanceGateway.sendBalanceUpdate(accountName, balance);
    this.logger.log(`Updated balance for ${accountName}: ${balance}$`);
  }

  // from REST
  private async updateBalances() {
    const accounts = await this.accountService.findAll();
    for (const account of accounts) {
      try {
        const balance = await this.exchangeService.getBalance(account.name);
        if (balance !== undefined) {
          const parsedBalance = parseFloat(balance.toFixed(2));
          this.balanceGateway.sendBalanceUpdate(account.name, balance);
          this.balances.set(account.name, parsedBalance);
          this.logger.log(
            `Updated balance for ${account.name}: ${parsedBalance}$`,
          );
        } else {
          this.logger.warn(
            `Could not retrieve balance for ${account.name} from exchange service`,
          );
        }

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
    setTimeout(() => this.updateBalances(), Timers.BALANCE_UPDATE_COOLDOWN);
  }
}
