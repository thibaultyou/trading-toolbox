import { Balances } from 'ccxt';

import { IWalletData } from '../core/core.interfaces';
import { IWalletAccount } from './types/wallet-account.interface';

export class BalanceConverter {
  static fromBalancestoWalletAccount(balances: Balances): IWalletAccount[] {
    return balances.info?.result?.list;
  }

  static fromWalletDatatoWalletAccount(walletData: IWalletData): IWalletAccount {
    return walletData;
  }

  // FIXME improve
  static fromBalancesToWalletContractAccount(balances: Balances): IWalletAccount {
    return BalanceConverter.fromBalancestoWalletAccount(balances).find(
      (walletAccount: IWalletAccount) => walletAccount.accountType === 'CONTRACT'
    );
  }
}
