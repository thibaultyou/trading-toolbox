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
    setInterval(() => {
      this.refreshAllBalances();
    }, Timers.BALANCES_CACHE_COOLDOWN);
  }

  addAccount(accountId: string) {
    if (!this.balances.has(accountId)) {
      this.refreshAccountBalances(accountId);
      this.logger.log(`Balance - Tracking Initiated - AccountID: ${accountId}`);
    } else {
      this.logger.warn(
        `Balance - Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`,
      );
    }
  }

  removeAccount(accountId: string) {
    if (this.balances.delete(accountId)) {
      this.logger.log(`Balance - Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(
        `Balance - Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`,
      );
    }
  }

  findAll(): Record<string, Balances> {
    this.logger.log(`Balances - Fetch Initiated`);

    return Object.fromEntries(this.balances);
  }

  findOne(accountId: string): Balances {
    this.logger.log(`Balance - Fetch Initiated - AccountID: ${accountId}`);

    if (!this.balances.has(accountId)) {
      this.logger.error(
        `Balance - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`,
      );

      throw new AccountNotFoundException(accountId);
    }

    return this.balances.get(accountId);
  }

  findUSDTBalance(accountId: string): USDTBalance {
    this.logger.log(
      `Balance (USDT) - Fetch Initiated - AccountID: ${accountId}`,
    );

    const balances = this.findOne(accountId);

    if (!balances || !balances.USDT) {
      this.logger.error(
        `Balance (USDT) - Fetch Failed - AccountID: ${accountId}, Reason: USDT Field Not Found`,
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

  private async refreshAccountBalances(accountId: string) {
    this.logger.log(`Balance - Refresh Initiated - AccountID: ${accountId}`);

    try {
      const balances = await this.exchangeService.getBalances(accountId);

      this.balances.set(accountId, balances);
      this.balanceGateway.sendBalancesUpdate(accountId, balances);
      this.eventEmitter.emit(
        Events.BALANCES_UPDATED,
        new BalancesUpdatedEvent(accountId, balances),
      );
      this.logger.debug(
        `Balance - Updated Successfully - AccountID: ${accountId}, Balances: ${JSON.stringify(balances)}`,
      );
      this.logger.log(
        `Balance - USDT Equity - AccountID: ${accountId}, Balance (USDT): ${extractUSDTEquity(balances, this.logger).toFixed(2)} $`,
      );
    } catch (error) {
      this.logger.error(
        `Balance - Update Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async refreshAllBalances() {
    this.logger.log(`Balances - Refresh Initiated`);
    const accountIds = Array.from(this.balances.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];

    const balancePromises = accountIds.map((accountId) =>
      this.refreshAccountBalances(accountId).catch((error) => {
        errors.push({ accountId, error });
      }),
    );

    await Promise.all(balancePromises);

    if (errors.length > 0) {
      const aggregatedError = new BalancesUpdateAggregatedException(errors);

      this.logger.error(
        `Balances - Multiple Updates Failed - Error: ${aggregatedError.message}`,
        aggregatedError.stack,
      );
      throw aggregatedError;
    }
  }
}
