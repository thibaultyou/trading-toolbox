import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { Events } from 'src/config';

import { IAccountTracker } from '../../common/types/account-tracker.interface';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { IWalletData } from '../core/core.interfaces';
import { ExchangeOperationFailedException } from '../exchange/exceptions/exchange.exceptions';
import { ExchangeService } from '../exchange/exchange.service';
import { logEffect, logError } from '../logger/logger.utils';
import { BalanceConverter } from './balance.converter';
import { BalanceGateway } from './balance.gateway';
import { BalancesUpdatedEvent } from './events/balances-updated.event';
import { IWalletAccount } from './types/wallet-account.interface';
import { extractUSDTEquity } from './utils/usdt-equity.util';

@Injectable()
export class BalanceService implements IAccountTracker {
  private logger = new Logger(BalanceService.name);
  private balances: Map<string, IWalletAccount> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private balanceGateway: BalanceGateway
  ) {}

  async startTrackingAccount(accountId: string): Promise<void> {
    if (!this.balances.has(accountId)) {
      this.logger.log(`Tracking Initiated - AccountID: ${accountId}`);
      await this.refreshOne(accountId)();
    } else {
      this.logger.warn(`Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.balances.delete(accountId)) {
      this.logger.log(`Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  processWalletData(accountId: string, walletData: IWalletData) {
    this.logger.log(`Balances - Processing Wallet Update Data - AccountID: ${accountId}`);

    const existingBalances = this.balances.get(accountId);

    if (!existingBalances) {
      this.logger.error(`Balances - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const updatedBalances = BalanceConverter.fromWalletDatatoWalletAccount(walletData);
    this.balances.set(accountId, updatedBalances);
    this.balanceGateway.sendBalancesUpdate(accountId, updatedBalances);
    const usdtEquity = extractUSDTEquity(updatedBalances, this.logger);
    this.logger.log(
      `Balances - Updated - AccountID: ${accountId}, Balance (USDT): ${usdtEquity.toFixed(2) ?? 'N/A'} $`
    );
    this.eventEmitter.emit(Events.BALANCES_UPDATED, new BalancesUpdatedEvent(accountId, usdtEquity));
  }

  getAccountBalances(accountId: string): IWalletAccount {
    this.logger.log(`Balances - Fetch Initiated - AccountID: ${accountId}`);

    if (!this.balances.has(accountId)) {
      this.logger.error(`Balances - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }
    return this.balances.get(accountId);
  }

  refreshOne = (accountId: string): TE.TaskEither<Error, IWalletAccount> =>
    pipe(
      TE.right(accountId),
      TE.tapIO(() => logEffect(this.logger, `Balances - Refresh Initiated - AccountID: ${accountId}`)(accountId)),
      TE.chain(() => this.exchangeService.getBalances(accountId)),
      TE.map((balances) => BalanceConverter.fromBalancesToWalletContractAccount(balances)),
      TE.tapIO((newBalances) => {
        this.balances.set(accountId, newBalances);
        this.balanceGateway.sendBalancesUpdate(accountId, newBalances);
        const usdtEquity = extractUSDTEquity(newBalances, this.logger);
        return () => {
          logEffect(
            this.logger,
            `Balances - Updated - AccountID: ${accountId}, Balance (USDT): ${usdtEquity.toFixed(2) ?? 'N/A'} $`
          )(newBalances);
          this.eventEmitter.emit(Events.BALANCES_UPDATED, new BalancesUpdatedEvent(accountId, usdtEquity));
        };
      }),
      TE.mapError((error) => new ExchangeOperationFailedException('refreshOne', error.message)),
      TE.tapError((error) =>
        logError(this.logger, `Balances - Update Failed - AccountID: ${accountId}, Error: ${error.message}`)(error)
      )
    );
}
