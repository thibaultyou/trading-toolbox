import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Balances } from 'ccxt';
import { Balance } from 'ccxt/js/src/base/types';

import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { ExchangeService } from '../exchange/exchange.service';
import { BalanceGateway } from './balance.gateway';
import { USDTBalance } from './balance.types';
import { BalancesUpdatedEvent } from './events/balances-updated.event';
import {
  BalancesUpdateAggregatedException,
  USDTBalanceNotFoundException,
} from './exceptions/balance.exceptions';
import { extractUSDTEquity } from './utils/usdt-equity.util';

@Injectable()
export class BalanceService {
  private logger = new Logger(BalanceService.name);
  private balances: Map<string, Balances> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private balanceGateway: BalanceGateway,
  ) {}

  async onModuleInit() {
    this.refreshAllAccountBalances();
    setInterval(() => {
      this.refreshAllAccountBalances();
    }, Timers.BALANCES_CACHE_COOLDOWN);
  }

  addAccount(accountId: string) {
    if (!this.balances.has(accountId)) {
      this.refreshAccountBalance(accountId);
      this.logger.log(
        `Balance - Account Tracking Initiated - Account ID: ${accountId}`,
      );
    } else {
      this.logger.warn(
        `Balance - Account Tracking Skipped - Account ID: ${accountId}, Reason: Already tracked`,
      );
    }
  }

  removeAccount(accountId: string) {
    if (this.balances.delete(accountId)) {
      this.logger.log(`Balance - Account Removed - Account ID: ${accountId}`);
    } else {
      this.logger.warn(
        `Balance - Account Removal Attempt Failed - Account ID: ${accountId}, Reason: Not tracked`,
      );
    }
  }

  findAll(): Record<string, Balances> {
    this.logger.log(`Balance - Fetching All Tracked Account Balances`);

    return Object.fromEntries(this.balances);
  }

  findOne(accountId: string): Balances {
    this.logger.debug(
      `Balance - Account Balances Fetch Initiated - Account ID: ${accountId}`,
    );

    if (!this.balances.has(accountId)) {
      this.logger.error(
        `Balance - Account Balances Fetch Failed - Account ID: ${accountId}, Reason: Account not found`,
      );

      throw new AccountNotFoundException(accountId);
    }

    const balances = this.balances.get(accountId);

    this.logger.log(
      `Balance - Fetched Account Balances Successfully - Account ID: ${accountId}`,
    );

    return balances;
  }

  findUSDTBalance(accountId: string): USDTBalance {
    this.logger.debug(
      `Balance - USDT Balance Fetch Initiated - Account ID: ${accountId}`,
    );

    const balances = this.findOne(accountId);

    if (!balances || !balances.USDT) {
      this.logger.error(
        `Balance - USDT Balance Not Found - Account ID: ${accountId}`,
      );
      throw new USDTBalanceNotFoundException(accountId);
    }

    const usdtEquity = extractUSDTEquity(balances, this.logger);
    const usdtBalance: Balance = balances.USDT;

    return {
      equity: usdtEquity,
      balance: usdtBalance,
    };
  }

  // TODO add updates from websocket ?

  private async refreshAccountBalance(accountId: string) {
    this.logger.debug(
      `Balance - Account Balances Refresh Initiated - Account ID: ${accountId}`,
    );

    try {
      const balances = await this.exchangeService.getBalances(accountId);

      this.balances.set(accountId, balances);
      this.balanceGateway.sendBalancesUpdate(accountId, balances);
      this.eventEmitter.emit(
        Events.BALANCES_UPDATED,
        new BalancesUpdatedEvent(accountId, balances),
      );
      this.logger.debug(
        `Balance - Refreshed Account Balances Successfully - Account ID: ${accountId}, Balances: ${JSON.stringify(balances)}`,
      );
      this.logger.log(
        `Balance - Refreshed Account USDT Equity - Account ID: ${accountId}, Balance (USDT): ${extractUSDTEquity(balances, this.logger).toFixed(2)} $`,
      );
    } catch (error) {
      this.logger.error(
        `Balance - Account Balances Refresh Failed - Account ID: ${accountId}, Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async refreshAllAccountBalances() {
    this.logger.debug(`Balance - All Account Balances Refresh Initiated`);

    const balancePromises = Array.from(this.balances.keys()).map((accountId) =>
      this.refreshAccountBalance(accountId),
    );

    const results = await Promise.allSettled(balancePromises);
    const errors: Array<{ accountId: string; error: Error }> = [];

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const accountId = Array.from(this.balances.keys())[index];

        this.logger.error(
          `Balance - All Account Balances Refresh Failed - Account ID: ${accountId}, Error: ${result.reason}`,
        );
        errors.push({ accountId, error: result.reason });
      }
    });

    if (errors.length > 0) {
      const aggregatedError = new BalancesUpdateAggregatedException(errors);

      this.logger.error(
        `Balance - All Account Balances Refresh Failures - Error: ${aggregatedError.message}`,
        aggregatedError.stack,
      );
      throw aggregatedError;
    } else {
      this.logger.log(`Balance - All Account Balances Refreshed Successfully`);
    }
  }
}
