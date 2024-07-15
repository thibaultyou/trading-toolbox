import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountTracker } from '@common/types/account-tracker.interface';
import { Events } from '@config/events.config';
import { IWalletData } from '@core/types/wallet-data.interface';
import { ExchangeService } from '@exchange/exchange.service';

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
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (!this.wallets.has(accountId)) {
      await this.fetchWallet(accountId);
      this.logger.log(`Started tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking skipped - AccountID: ${accountId} - Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    this.logger.debug(`Stopping account tracking - AccountID: ${accountId}`);

    if (this.wallets.delete(accountId)) {
      this.logger.log(`Stopped tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking removal failed - AccountID: ${accountId} - Reason: Not tracked`);
    }
  }

  getWallets(accountId: string): IWalletAccount {
    this.logger.debug(`Fetching wallets - AccountID: ${accountId}`);

    if (!this.wallets.has(accountId)) {
      this.logger.warn(`Wallets not found - AccountID: ${accountId}`);
      throw new AccountNotFoundException(accountId);
    }
    return this.wallets.get(accountId);
  }

  getUSDTBalance(accountId: string): number {
    this.logger.debug(`Fetching USDT balance - AccountID: ${accountId}`);
    const balance = extractUSDTEquity(this.getWallets(accountId), this.logger);
    this.logger.debug(`Fetched USDT balance - AccountID: ${accountId} - Balance: ${balance}`);
    return balance;
  }

  processWalletData(accountId: string, walletData: IWalletData) {
    this.logger.debug(`Processing wallet data - AccountID: ${accountId}`);

    const existingWallets = this.wallets.get(accountId);

    if (!existingWallets) {
      this.logger.warn(`Wallet data processing failed - AccountID: ${accountId} - Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const updatedBalances = fromWalletDataToWalletAccount(walletData);
    this.wallets.set(accountId, updatedBalances);
    const usdtEquity = extractUSDTEquity(updatedBalances, this.logger);
    this.logger.log(
      `Processed wallet data - AccountID: ${accountId} - USDT Balance: ${usdtEquity.toFixed(2) ?? 'N/A'} $`
    );
    this.eventEmitter.emit(Events.WALLETS_UPDATED, new WalletsUpdatedEvent(accountId, usdtEquity));
  }

  async fetchWallet(accountId: string): Promise<IWalletAccount> {
    this.logger.debug(`Fetching wallet - AccountID: ${accountId}`);

    try {
      const balances = await this.exchangeService.getBalances(accountId);
      const walletAccounts = fromBalancesToWalletContractAccount(balances);
      this.wallets.set(accountId, walletAccounts);
      const usdtEquity = extractUSDTEquity(walletAccounts, this.logger);
      this.eventEmitter.emit(Events.WALLETS_UPDATED, new WalletsUpdatedEvent(accountId, usdtEquity));
      this.logger.log(`Fetched wallet - AccountID: ${accountId} - USDT Balance: ${usdtEquity.toFixed(2) ?? 'N/A'} $`);
      return walletAccounts;
    } catch (error) {
      this.logger.error(`Wallet fetch failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
// this.walletGateway.sendWalletsUpdate(accountId, updatedBalances);

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
