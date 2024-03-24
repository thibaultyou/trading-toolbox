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
  private balances: Map<string, Balances> = new Map(); // accountId -> Balances
  private accounts: Set<string> = new Set();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private balanceGateway: BalanceGateway,
  ) {}

  async onModuleInit() {
    this.refreshAllBalances();
    setInterval(() => {
      this.refreshAllBalances();
    }, Timers.BALANCES_CACHE_COOLDOWN);
  }

  addAccount(accountId: string) {
    this.accounts.add(accountId);
    this.refreshAccountBalance(accountId);
  }

  findAll(): Record<string, Balances> {
    this.logger.log(`Fetching all balances`);

    return Object.fromEntries(this.balances);
  }

  findOne(accountId: string): Balances {
    this.logger.log(`Balances fetch initiated - AccountID: ${accountId}`);

    if (!this.balances.has(accountId)) {
      this.logger.error(
        `Balances fetch failed - AccountID: ${accountId}, Reason: Account not found`,
      );
      throw new AccountNotFoundException(accountId);
    }

    return this.balances.get(accountId);
  }

  findUSDTBalance(accountId: string): USDTBalance {
    this.logger.log(`Balance (USDT) fetch initiated - AccountID: ${accountId}`);

    const balances = this.findOne(accountId);

    if (!balances || !balances.USDT) {
      this.logger.error(`Balance (USDT) not found - AccountID: ${accountId}`);
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

  private async refreshAccountBalance(accountId: string): Promise<void> {
    try {
      const balances = await this.exchangeService.getBalances(accountId);

      this.balances.set(accountId, balances);
      this.balanceGateway.sendBalancesUpdate(accountId, balances);
      this.eventEmitter.emit(
        Events.BALANCES_UPDATED,
        new BalancesUpdatedEvent(accountId, balances),
      );
      this.logger.debug(
        `Balances updated - AccountID: ${accountId}, Balances: ${JSON.stringify(balances)}`,
      );
      this.logger.log(
        `Balances updated - AccountID: ${accountId}, Balance (USDT): ${extractUSDTEquity(balances, this.logger).toFixed(2)} $`,
      );
    } catch (error) {
      this.logger.error(
        `Balances update failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async refreshAllBalances() {
    const balancePromises = Array.from(this.accounts).map((accountId) =>
      this.refreshAccountBalance(accountId),
    );

    const results = await Promise.allSettled(balancePromises);
    const errors: Array<{ accountId: string; error: Error }> = [];

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const accountId = Array.from(this.accounts)[index];

        errors.push({ accountId, error: result.reason });
      }
    });

    if (errors.length > 0) {
      const aggregatedError = new BalancesUpdateAggregatedException(errors);

      this.logger.error(
        `Some balances updates failed - Error: ${aggregatedError.message}`,
        aggregatedError.stack,
      );
      throw aggregatedError;
    }
  }
}
