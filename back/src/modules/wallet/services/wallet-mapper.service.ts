import { Injectable } from '@nestjs/common';
import { Balances } from 'ccxt';

import { IWalletData } from '@exchange/types/wallet-data.interface';
import { CoinDetailDto } from '@wallet/dtos/coin-detail.dto';
import { WalletDto } from '@wallet/dtos/wallet.dto';
import { ICoinData } from '@wallet/types/coin-data.interface';
import { WalletAccountType } from '@wallet/types/wallet-account-type.enum';
import { IWalletAccount } from '@wallet/types/wallet-account.interface';

@Injectable()
export class WalletMapperService {
  toDto(walletAccount: IWalletAccount, currency: string = 'USDT'): WalletDto {
    return new WalletDto(walletAccount, currency);
  }

  fromBalancesToWalletAccount(balances: Balances): IWalletAccount[] {
    return balances.info?.result?.list || [];
  }

  fromWalletDataToWalletAccount(walletData: IWalletData): IWalletAccount {
    return walletData;
  }

  fromBalancesToWalletContractAccount(balances: Balances): IWalletAccount {
    const walletAccounts = this.fromBalancesToWalletAccount(balances);
    return walletAccounts.find(
      (walletAccount: IWalletAccount) => walletAccount.accountType === WalletAccountType.CONTRACT
    );
  }

  toCoinDetailDto(coinData: ICoinData): CoinDetailDto {
    return new CoinDetailDto(coinData);
  }
}
