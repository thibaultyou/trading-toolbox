import { Injectable, Logger } from '@nestjs/common';

import { AccountService } from '../account/account.service';
import { Timers } from '../config';
import { ExchangeService } from '../exchange/exchange.service';
import { BalanceGateway } from './balance.gateway';
import { FetchAccountBalanceException } from './exceptions/balance.exceptions';

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
    this.refreshAllAccountBalances();
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

  async refreshAccountBalance(accountName: string): Promise<void> {
    await this.fetchBalanceAndUpdateCache(accountName);
  }

  // from REST
  private async refreshAllAccountBalances() {
    const accounts = await this.accountService.findAll();
    for (const account of accounts) {
      await this.fetchBalanceAndUpdateCache(account.name);
      await this.delay(Timers.BALANCE_UPDATE_COOLDOWN);
    }
    setTimeout(
      () => this.refreshAllAccountBalances(),
      Timers.BALANCE_UPDATE_COOLDOWN,
    );
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
