import { Injectable, Logger } from '@nestjs/common';
import { Balances } from 'ccxt';
import { Balance } from 'ccxt/js/src/base/types';

import { Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { ExchangeService } from '../exchange/exchange.service';
import { BalanceGateway } from './balance.gateway';
import { USDTBalance } from './balance.types';
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
    private exchangeService: ExchangeService,
    private balanceGateway: BalanceGateway,
  ) {}

  async onModuleInit() {
    this.refreshAccountBalances();
    setInterval(() => {
      this.refreshAccountBalances();
    }, Timers.BALANCES_CACHE_COOLDOWN);
  }

  findAll(): Record<string, Balances> {
    this.logger.log(`Fetching all balances`);

    return Object.fromEntries(this.balances);
  }

  findOne(accountId: string): Balances {
    this.logger.log(`Balances fetch initiated - AccountID: ${accountId}`);

    if (!this.balances.has(accountId)) {
      this.logger.error(`Account not found - AccountID: ${accountId}`);
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

  // from WebSocket
  // FIXME add me back
  // updateBalanceFromWebSocket(accountId: string, balances: Balances) {
  //   this.balances.set(accountId, balances);
  //   this.balanceGateway.sendBalancesUpdate(accountId, balances);
  //   this.logger.log(`Balances updated from WebSocket - AccountID: ${accountId}, Balances: ${JSON.stringify(balances)}`);
  // }

  // from REST
  private async refreshAccountBalances() {
    const initializedAccountIds =
      this.exchangeService.getInitializedAccountIds();
    const errors: Array<{ accountId: string; error: Error }> = [];

    const balancesPromises = initializedAccountIds.map(async (accountId) => {
      try {
        const balances = await this.exchangeService.getBalances(accountId);

        this.balances.set(accountId, balances);
        this.balanceGateway.sendBalancesUpdate(accountId, balances);
        this.logger.debug(
          `Balances updated - AccountID: ${accountId}, Balances: ${JSON.stringify(balances)}`,
        );
        this.logger.log(
          `Balances updated - AccountID: ${accountId}, Balance (USDT): ${extractUSDTEquity(balances, this.logger)}$`,
        );
      } catch (error) {
        this.logger.error(
          `Balances update failed - AccountID: ${accountId}, Error: ${error.message}`,
          error.stack,
        );
        errors.push({ accountId, error });
      }
    });

    try {
      await Promise.all(balancesPromises);

      if (errors.length > 0) {
        throw new BalancesUpdateAggregatedException(errors);
      }
    } catch (aggregatedError) {
      this.logger.error(
        `Balances update failed - Error: ${aggregatedError.message}`,
        aggregatedError.stack,
      );
      throw aggregatedError;
    }
  }
}
