import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { IAccountTracker } from '../../common/types/account-tracker.interface';
import { Events } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { IWalletData } from '../core/types/wallet-data.interface';
import { ExchangeService } from '../exchange/exchange.service';
import { BalanceGateway } from './balance.gateway';
import { extractUSDTEquity, fromBalancesToWalletContractAccount, fromWalletDataToWalletAccount } from './balance.utils';
import { BalancesUpdatedEvent } from './events/balances-updated.event';
import { IWalletAccount } from './types/wallet-account.interface';

@Injectable()
export class BalanceService implements IAccountTracker {
  private logger = new Logger(BalanceService.name);
  private balances: Map<string, IWalletAccount> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private balanceGateway: BalanceGateway
  ) {}

  async startTrackingAccount(accountId: string) {
    if (!this.balances.has(accountId)) {
      this.logger.log(`Tracking Initiated - AccountID: ${accountId}`);
      await this.fetchWallet(accountId);
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

  getBalances(accountId: string): IWalletAccount {
    this.logger.log(`Balances - Fetch Initiated - AccountID: ${accountId}`);

    if (!this.balances.has(accountId)) {
      this.logger.error(`Balances - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }
    return this.balances.get(accountId);
  }

  getUSDTBalance(accountId: string): number {
    return extractUSDTEquity(this.getBalances(accountId), this.logger);
  }

  processWalletData(accountId: string, walletData: IWalletData) {
    this.logger.log(`Wallet Data - Update Initiated - AccountID: ${accountId}`);

    const existingBalances = this.balances.get(accountId);

    if (!existingBalances) {
      this.logger.error(`Wallet Data - Update Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const updatedBalances = fromWalletDataToWalletAccount(walletData);
    this.balances.set(accountId, updatedBalances);
    this.balanceGateway.sendBalancesUpdate(accountId, updatedBalances);
    const usdtEquity = extractUSDTEquity(updatedBalances, this.logger);
    this.logger.log(
      `Wallet Data - Updated - AccountID: ${accountId}, Balance (USDT): ${usdtEquity.toFixed(2) ?? 'N/A'} $`
    );
    this.eventEmitter.emit(Events.BALANCES_UPDATED, new BalancesUpdatedEvent(accountId, usdtEquity));
  }

  async fetchWallet(accountId: string): Promise<IWalletAccount> {
    this.logger.log(`Balances - Refresh Initiated - AccountID: ${accountId}`);

    try {
      const balances = await this.exchangeService.getBalances(accountId);
      const walletAccounts = fromBalancesToWalletContractAccount(balances);
      this.balances.set(accountId, walletAccounts);
      this.balanceGateway.sendBalancesUpdate(accountId, walletAccounts);
      const usdtEquity = extractUSDTEquity(walletAccounts, this.logger);
      this.eventEmitter.emit(Events.BALANCES_UPDATED, new BalancesUpdatedEvent(accountId, usdtEquity));
      this.logger.log(
        `Balances - Updated - AccountID: ${accountId}, Balance (USDT): ${usdtEquity.toFixed(2) ?? 'N/A'} $`
      );
      return walletAccounts;
    } catch (error) {
      this.logger.error(`Balances - Update Failed - AccountID: ${accountId}, Reason: ${error.message}`);
      throw error;
    }
  }

  //   fetchWallet = (accountId: string): TE.TaskEither<Error, IWalletAccount> =>
  //     pipe(
  //       TE.right(accountId),
  //       TE.tapIO(() => logEffect(this.logger, `Balances - Refresh Initiated - AccountID: ${accountId}`)(accountId)),
  //       TE.chain(() => this.exchangeService.getBalances(accountId)),
  //       TE.map((balances) => BalanceConverter.fromBalancesToWalletContractAccount(balances)),
  //       TE.tapIO((newBalances) => {
  //         this.balances.set(accountId, newBalances);
  //         this.balanceGateway.sendBalancesUpdate(accountId, newBalances);
  //         const usdtEquity = extractUSDTEquity(newBalances, this.logger);
  //         return () => {
  //           logEffect(
  //             this.logger,
  //             `Balances - Updated - AccountID: ${accountId}, Balance (USDT): ${usdtEquity.toFixed(2) ?? 'N/A'} $`
  //           )(newBalances);
  //           this.eventEmitter.emit(Events.BALANCES_UPDATED, new BalancesUpdatedEvent(accountId, usdtEquity));
  //         };
  //       }),
  //       TE.mapError((error) => new ExchangeOperationFailedException('refreshOne', error.message)),
  //       TE.tapError((error) =>
  //         logError(this.logger, `Balances - Update Failed - AccountID: ${accountId}, Error: ${error.message}`)(error)
  //       )
  //     );
}
