import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { IAccountTracker } from '../../common/types/account-tracker.interface';
import { Events } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { IWalletData } from '../core/types/wallet-data.interface';
import { ExchangeService } from '../exchange/exchange.service';
import { WalletsUpdatedEvent } from './events/wallets-updated.event';
import { IWalletAccount } from './types/wallet-account.interface';
import { WalletGateway } from './wallet.gateway';
import { extractUSDTEquity, fromBalancesToWalletContractAccount, fromWalletDataToWalletAccount } from './wallet.utils';

@Injectable()
export class WalletService implements IAccountTracker {
  private logger = new Logger(WalletService.name);
  private wallets: Map<string, IWalletAccount> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private walletGateway: WalletGateway
  ) {}

  async startTrackingAccount(accountId: string) {
    if (!this.wallets.has(accountId)) {
      this.logger.log(`Tracking Initiated - AccountID: ${accountId}`);
      await this.fetchWallet(accountId);
    } else {
      this.logger.warn(`Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.wallets.delete(accountId)) {
      this.logger.log(`Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  getWallets(accountId: string): IWalletAccount {
    this.logger.log(`Wallets - Fetch Initiated - AccountID: ${accountId}`);

    if (!this.wallets.has(accountId)) {
      this.logger.error(`Wallets - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }
    return this.wallets.get(accountId);
  }

  getUSDTBalance(accountId: string): number {
    return extractUSDTEquity(this.getWallets(accountId), this.logger);
  }

  processWalletData(accountId: string, walletData: IWalletData) {
    this.logger.log(`Wallet Data - Update Initiated - AccountID: ${accountId}`);

    const existingWallets = this.wallets.get(accountId);

    if (!existingWallets) {
      this.logger.error(`Wallet Data - Update Failed - AccountID: ${accountId}, Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const updatedBalances = fromWalletDataToWalletAccount(walletData);
    this.wallets.set(accountId, updatedBalances);
    // this.walletGateway.sendWalletsUpdate(accountId, updatedBalances);
    const usdtEquity = extractUSDTEquity(updatedBalances, this.logger);
    this.logger.log(
      `Wallet Data - Updated - AccountID: ${accountId}, Balance (USDT): ${usdtEquity.toFixed(2) ?? 'N/A'} $`
    );
    this.eventEmitter.emit(Events.WALLETS_UPDATED, new WalletsUpdatedEvent(accountId, usdtEquity));
  }

  async fetchWallet(accountId: string): Promise<IWalletAccount> {
    this.logger.log(`Wallets - Refresh Initiated - AccountID: ${accountId}`);

    try {
      const balances = await this.exchangeService.getBalances(accountId);
      const walletAccounts = fromBalancesToWalletContractAccount(balances);
      this.wallets.set(accountId, walletAccounts);
      // this.walletGateway.sendWalletsUpdate(accountId, walletAccounts);
      const usdtEquity = extractUSDTEquity(walletAccounts, this.logger);
      this.eventEmitter.emit(Events.WALLETS_UPDATED, new WalletsUpdatedEvent(accountId, usdtEquity));
      this.logger.log(
        `Wallets - Updated - AccountID: ${accountId}, Balance (USDT): ${usdtEquity.toFixed(2) ?? 'N/A'} $`
      );
      return walletAccounts;
    } catch (error) {
      this.logger.error(`Wallets - Update Failed - AccountID: ${accountId}, Reason: ${error.message}`);
      throw error;
    }
  }

  //   fetchWallet = (accountId: string): TE.TaskEither<Error, IWalletAccount> =>
  //     pipe(
  //       TE.right(accountId),
  //       TE.tapIO(() => logEffect(this.logger, `Wallets - Refresh Initiated - AccountID: ${accountId}`)(accountId)),
  //       TE.chain(() => this.exchangeService.getBalances(accountId)),
  //       TE.map((balances) => BalanceConverter.fromBalancesToWalletContractAccount(balances)),
  //       TE.tapIO((newBalances) => {
  //         this.wallets.set(accountId, newBalances);
  //         this.walletGateway.sendBalancesUpdate(accountId, newBalances);
  //         const usdtEquity = extractUSDTEquity(newBalances, this.logger);
  //         return () => {
  //           logEffect(
  //             this.logger,
  //             `Wallets - Updated - AccountID: ${accountId}, Balance (USDT): ${usdtEquity.toFixed(2) ?? 'N/A'} $`
  //           )(newBalances);
  //           this.eventEmitter.emit(Events.WALLETS_UPDATED, new BalancesUpdatedEvent(accountId, usdtEquity));
  //         };
  //       }),
  //       TE.mapError((error) => new ExchangeOperationFailedException('refreshOne', error.message)),
  //       TE.tapError((error) =>
  //         logError(this.logger, `Wallets - Update Failed - AccountID: ${accountId}, Error: ${error.message}`)(error)
  //       )
  //     );
}
