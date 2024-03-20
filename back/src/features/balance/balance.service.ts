import { Injectable, Logger } from '@nestjs/common';

import { Timers } from '../../config';
import { delay } from '../../utils/delay.util';
import { ExchangeService } from '../exchange/exchange.service';

import { BalanceGateway } from './balance.gateway';
import { FetchAccountBalanceException } from './exceptions/balance.exceptions';

@Injectable()
export class BalanceService {
  private logger = new Logger(BalanceService.name);
  private balances: Map<string, number> = new Map();

  constructor(
    private exchangeService: ExchangeService,
    private balanceGateway: BalanceGateway,
  ) {}

  async onModuleInit() {
    this.refreshAllAccountBalances();
    setInterval(() => {
      this.refreshAllAccountBalances();
    }, Timers.BALANCE_UPDATE_COOLDOWN);
  }

  getBalances(): Record<string, number> {
    return Object.fromEntries(this.balances);
  }

  async getOrRefreshAccountBalance(accountName: string): Promise<number> {
    let balance = this.balances.get(accountName);
    if (balance === undefined) {
      balance = await this.fetchBalanceAndUpdateCache(accountName);
    }
    return balance;
  }

  // from WebSocket
  updateBalanceFromWebSocket(accountName: string, balance: number): void {
    this.balances.set(accountName, balance);
    this.balanceGateway.sendBalanceUpdate(accountName, balance);
    this.logger.log(
      `Balance updated from WebSocket for ${accountName}: ${balance}$`,
    );
  }

  // from REST
  private async refreshAllAccountBalances() {
    const initializedAccountNames =
      this.exchangeService.getInitializedAccountNames();
    try {
      for (const accountName of initializedAccountNames) {
        try {
          await this.fetchBalanceAndUpdateCache(accountName);
        } catch (error) {
          this.logger.error(
            `Failed to update balance for account ${accountName}: ${error.message}`,
            error.stack,
          );
        }
        await delay(Timers.BALANCE_UPDATE_COOLDOWN);
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch accounts for balance update: ${error.message}`,
        error.stack,
      );
    }
  }

  private async fetchBalanceAndUpdateCache(
    accountName: string,
  ): Promise<number> {
    try {
      const balance = await this.exchangeService.getBalance(accountName);
      const parsedBalance = parseFloat(balance.toFixed(2));
      this.balances.set(accountName, parsedBalance);
      this.balanceGateway.sendBalanceUpdate(accountName, parsedBalance);
      this.logger.log(
        `Updated balance for ${accountName} account: ${parsedBalance}$`,
      );
      return parsedBalance;
    } catch (error) {
      this.logger.error(
        `Error updating balance for ${accountName}: ${error.message}`,
        error.stack,
      );
      throw new FetchAccountBalanceException(accountName, error);
    }
  }
}
