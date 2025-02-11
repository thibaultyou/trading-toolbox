import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountSynchronizer } from '@common/interfaces/account-synchronizer.interface';
import { IAccountTracker } from '@common/interfaces/account-tracker.interface';
import { ConfigService } from '@config';
import { ExchangeService } from '@exchange/exchange.service';
import { IWalletData } from '@exchange/types/wallet-data.interface';

import { WalletsUpdatedEvent } from './events/wallets-updated.event';
import { WalletMapperService } from './services/wallet-mapper.service';
import { IWalletAccount } from './types/wallet-account.interface';
import { extractUSDTEquity } from './wallet.utils';

@Injectable()
export class WalletService implements IAccountTracker, IAccountSynchronizer<IWalletAccount | null> {
  private readonly logger = new Logger(WalletService.name);
  private readonly wallets: Map<string, IWalletAccount> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly exchangeService: ExchangeService,
    private readonly walletMapper: WalletMapperService,
    private readonly configService: ConfigService
    // private readonly walletGateway: WalletGateway, // NOTE Needed for serveer-side updates
  ) {}

  async startTrackingAccount(accountId: string): Promise<void> {
    this.logger.debug(`startTrackingAccount() - start | accountId=${accountId}`);

    if (this.wallets.has(accountId)) {
      this.logger.warn(`startTrackingAccount() - skip | accountId=${accountId}, reason=Already tracked`);
      return;
    }

    try {
      const walletAccount = await this.syncAccount(accountId);

      if (!walletAccount) {
        this.logger.warn(
          `startTrackingAccount() - skip | accountId=${accountId}, reason=No wallet data or fetch failed`
        );
        return;
      }

      this.wallets.set(accountId, walletAccount);
      this.logger.log(`startTrackingAccount() - success | accountId=${accountId}, tracking=started`);
    } catch (error) {
      this.logger.error(`startTrackingAccount() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
    }
  }

  stopTrackingAccount(accountId: string): void {
    this.logger.debug(`stopTrackingAccount() - start | accountId=${accountId}`);

    if (this.wallets.delete(accountId)) {
      this.logger.log(`stopTrackingAccount() - success | accountId=${accountId}, tracking=stopped`);
    } else {
      this.logger.warn(`stopTrackingAccount() - skip | accountId=${accountId}, reason=Not tracked`);
    }
  }

  getWallets(accountId: string): IWalletAccount {
    this.logger.debug(`getWallets() - start | accountId=${accountId}`);

    if (!this.wallets.has(accountId)) {
      this.logger.warn(`getWallets() - not found | accountId=${accountId}, reason=No wallet`);
      throw new AccountNotFoundException(accountId);
    }

    this.logger.log(`getWallets() - success | accountId=${accountId}`);
    return this.wallets.get(accountId) as IWalletAccount;
  }

  getUSDTBalance(accountId: string): number {
    this.logger.debug(`getUSDTBalance() - start | accountId=${accountId}`);

    const walletAccount = this.getWallets(accountId);
    const balance = extractUSDTEquity(walletAccount);
    this.logger.log(`getUSDTBalance() - success | accountId=${accountId}, usdtBalance=${balance}`);
    return balance;
  }

  processWalletData(accountId: string, walletData: IWalletData): void {
    this.logger.debug(`processWalletData() - start | accountId=${accountId}`);

    const existingWallet = this.wallets.get(accountId);

    if (!existingWallet) {
      this.logger.warn(`processWalletData() - skip | accountId=${accountId}, reason=Wallet not tracked`);
      throw new AccountNotFoundException(accountId);
    }

    const updatedWallet = this.walletMapper.fromWalletDataToWalletAccount(walletData);
    const oldUsdtEquity = extractUSDTEquity(existingWallet);
    const newUsdtEquity = extractUSDTEquity(updatedWallet);
    // NOTE Update only if there's a noticeable difference
    const threshold = 0.01;
    const delta = Math.abs(newUsdtEquity - oldUsdtEquity);

    if (delta > threshold) {
      this.wallets.set(accountId, updatedWallet);

      this.logger.log(
        `processWalletData() - success | accountId=${accountId}, usdtBalance=${newUsdtEquity.toFixed(2)}`
      );
      this.eventEmitter.emit(
        this.configService.events.Wallet.BULK_UPDATED,
        new WalletsUpdatedEvent(accountId, newUsdtEquity)
      );

      // NOTE Broadcast changes via websockets:
      // this.walletGateway.sendWalletsUpdate(accountId, updatedWallet);
    } else {
      this.logger.debug(`processWalletData() - skip | accountId=${accountId}, reason=No significant change`);
    }
  }

  async syncAccount(accountId: string): Promise<IWalletAccount | null> {
    this.logger.debug(`syncAccount() - start | accountId=${accountId}`);

    try {
      const balances = await this.exchangeService.getBalances(accountId);

      if (!balances?.info) {
        this.logger.warn(`syncAccount() - skip | accountId=${accountId}, reason=No 'info' in balances`);
        return null;
      }

      const walletAccount = this.walletMapper.fromBalancesToWalletContractAccount(balances);

      if (!walletAccount) {
        this.logger.warn(`syncAccount() - skip | accountId=${accountId}, reason=No CONTRACT wallet found`);
        return null;
      }

      const usdtEquity = extractUSDTEquity(walletAccount);
      this.logger.log(`syncAccount() - success | accountId=${accountId}, usdtBalance=${usdtEquity.toFixed(2)}`);

      this.eventEmitter.emit(
        this.configService.events.Wallet.BULK_UPDATED,
        new WalletsUpdatedEvent(accountId, usdtEquity)
      );
      return walletAccount;
    } catch (error) {
      this.logger.error(`syncAccount() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      return null;
    }
  }

  async syncAllAccounts(): Promise<void> {
    this.logger.debug('syncAllAccounts() - start | reason=Not implemented');
    // FIXME Implementation pending...
    throw new Error('Method not implemented.');
  }
}
