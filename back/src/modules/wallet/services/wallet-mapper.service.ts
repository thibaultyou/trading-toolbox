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
    // --- Bybit style (previous usage) ---
    if (balances.info?.result?.list) {
      return balances.info.result.list;
    }

    // --- Bitget style ---
    if (balances.info?.data && Array.isArray(balances.info.data)) {
      return balances.info.data.map((entry: any) => {
        const marginCoin = entry.marginCoin || 'USDT';
        const frozen = parseFloat(entry.locked ?? entry.frozen ?? '0');
        const available = parseFloat(entry.available || '0');
        const total = frozen + available;
        const equity = entry.usdtEquity ?? entry.accountEquity ?? entry.equity ?? total;
        const unrealisedPnl = entry.unrealizedPL ?? entry.unrealisedPnl ?? '0';

        const walletAccount: IWalletAccount = {
          accountType: WalletAccountType.CONTRACT,
          coin: [
            {
              coin: marginCoin,
              equity: String(equity),
              walletBalance: String(total),
              availableToWithdraw: String(available),
              unrealisedPnl: String(unrealisedPnl)
            }
          ]
        };
        return walletAccount;
      });
    }

    return [];
  }

  fromBalancesToWalletContractAccount(balances: Balances): IWalletAccount | undefined {
    const walletAccounts = this.fromBalancesToWalletAccount(balances);
    return walletAccounts.find(
      (walletAccount: IWalletAccount) => walletAccount.accountType === WalletAccountType.CONTRACT
    );
  }

  fromWalletDataToWalletAccount(walletData: IWalletData): IWalletAccount {
    if (walletData.accountType && walletData.coin) {
      return walletData; // i.e. Bybit style
    }

    if ('marginCoin' in walletData) {
      const entry = walletData as any;
      const marginCoin = entry.marginCoin || 'USDT';
      const frozen = parseFloat(entry.locked ?? entry.frozen ?? '0');
      const available = parseFloat(entry.available || '0');
      const total = frozen + available;
      const equity = entry.usdtEquity ?? entry.accountEquity ?? entry.equity ?? total;
      const unrealisedPnl = entry.unrealizedPL ?? entry.unrealisedPnl ?? '0';

      return {
        accountType: WalletAccountType.CONTRACT,
        coin: [
          {
            coin: marginCoin,
            equity: String(equity),
            walletBalance: String(total),
            availableToWithdraw: String(available),
            unrealisedPnl: String(unrealisedPnl)
          }
        ]
      };
    }

    return {
      accountType: '',
      coin: []
    };
  }

  toCoinDetailDto(coinData: ICoinData): CoinDetailDto {
    return new CoinDetailDto(coinData);
  }
}
