import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountTracker } from '@common/types/account-tracker.interface';
import { Events } from '@config';
import { ExchangeService } from '@exchange/exchange.service';
import { IWalletData } from '@exchange/types/wallet-data.interface';

import { WalletsUpdatedEvent } from './events/wallets-updated.event';
import { WalletMapperService } from './services/wallet-mapper.service';
import { IWalletAccount } from './types/wallet-account.interface';
import { WalletUtils } from './wallet.utils';

@Injectable()
export class WalletService implements IAccountTracker {
  private logger = new Logger(WalletService.name);
  private wallets: Map<string, IWalletAccount> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private walletMapper: WalletMapperService
    // private walletGateway: WalletGateway,
  ) {}

  async startTrackingAccount(accountId: string) {
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (this.wallets.has(accountId)) {
      this.logger.warn(`Account tracking skipped - AccountID: ${accountId} - Reason: Already tracked`);
      return;
    }

    try {
      const walletAccount = await this.fetchWallet(accountId);
      if (!walletAccount) {
        this.logger.warn(`Skipped tracking account - AccountID: ${accountId} - Reason: No wallet data or fetch failed`);
        return;
      }

      this.wallets.set(accountId, walletAccount);
      this.logger.log(`Started tracking account - AccountID: ${accountId}`);
    } catch (error) {
      this.logger.warn(`Account tracking failed - AccountID: ${accountId} - Error: ${error.message}`);
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
    const walletAccount = this.getWallets(accountId);
    const balance = WalletUtils.extractUSDTEquity(walletAccount);
    this.logger.debug(`Fetched USDT balance - AccountID: ${accountId} - Balance: ${balance}`);
    return balance;
  }

  processWalletData(accountId: string, walletData: IWalletData) {
    this.logger.debug(`Processing wallet data - AccountID: ${accountId}`);

    const existingWallet = this.wallets.get(accountId);
    if (!existingWallet) {
      this.logger.warn(`Wallet data processing failed - AccountID: ${accountId} - Reason: Account not found`);
      throw new AccountNotFoundException(accountId);
    }

    const updatedWallet = this.walletMapper.fromWalletDataToWalletAccount(walletData);
    const oldUsdtEquity = WalletUtils.extractUSDTEquity(existingWallet);
    const newUsdtEquity = WalletUtils.extractUSDTEquity(updatedWallet);
    const threshold = 0.01;
    const delta = Math.abs(newUsdtEquity - oldUsdtEquity);

    if (delta > threshold) {
      this.wallets.set(accountId, updatedWallet);
      this.logger.log(
        `Processed wallet data - AccountID: ${accountId} - USDT Balance: ${newUsdtEquity.toFixed(2)} $ (delta: ${delta.toFixed(4)})`
      );
      this.eventEmitter.emit(Events.Wallet.BULK_UPDATED, new WalletsUpdatedEvent(accountId, newUsdtEquity));
    }
  }

  async fetchWallet(accountId: string): Promise<IWalletAccount | null> {
    this.logger.debug(`Fetching wallet - AccountID: ${accountId}`);

    try {
      const balances = await this.exchangeService.getBalances(accountId);

      if (!balances?.info) {
        this.logger.warn(`No 'info' in balances - AccountID: ${accountId}`);
        return null;
      }

      const walletAccount = this.walletMapper.fromBalancesToWalletContractAccount(balances);
      if (!walletAccount) {
        this.logger.warn(`No CONTRACT wallet found in balances - AccountID: ${accountId}`);
        return null;
      }

      const usdtEquity = WalletUtils.extractUSDTEquity(walletAccount);

      this.logger.log(`Fetched wallet - AccountID: ${accountId} - USDT Balance: ${usdtEquity.toFixed(2)} $`);

      this.eventEmitter.emit(Events.Wallet.BULK_UPDATED, new WalletsUpdatedEvent(accountId, usdtEquity));

      return walletAccount;
    } catch (error) {
      this.logger.error(`Wallet fetch failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      return null;
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
