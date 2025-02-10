import { Injectable } from '@nestjs/common';
import { Balances } from 'ccxt';

import { IBaseMapper } from '@common/interfaces/base-mapper.interface';
import { IWalletData } from '@exchange/types/wallet-data.interface';
import { WalletDto } from '@wallet/dtos/wallet.dto';
import { WalletAccountType } from '@wallet/types/wallet-account-type.enum';
import { IWalletAccount } from '@wallet/types/wallet-account.interface';

@Injectable()
export class WalletMapperService implements IBaseMapper<IWalletAccount, WalletDto> {
  toDto(walletAccount: IWalletAccount, currency: string = 'USDT'): WalletDto {
    return new WalletDto(walletAccount, currency);
  }

  fromExternal(external: any): IWalletAccount {
    if (external && external.info) {
      const walletAccounts = this.fromBalancesToWalletAccount(external as Balances);
      return (
        walletAccounts.find((wa: IWalletAccount) => wa.accountType === WalletAccountType.CONTRACT) || {
          accountType: '',
          coin: []
        }
      );
    }

    if (external && external.accountType && external.coin) {
      return external as IWalletAccount;
    }

    if (external && 'marginCoin' in external) {
      const marginCoin = external.marginCoin || 'USDT';
      const frozen = parseFloat(external.locked ?? external.frozen ?? '0');
      const available = parseFloat(external.available || '0');
      const total = frozen + available;
      const equity = external.usdtEquity ?? external.accountEquity ?? external.equity ?? total;
      const unrealisedPnl = external.unrealizedPL ?? external.unrealisedPnl ?? '0';
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
    return { accountType: '', coin: [] };
  }

  private fromBalancesToWalletAccount(balances: Balances): IWalletAccount[] {
    // --- Bybit style ---
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

  fromBalancesToWalletContractAccount(balances: any): IWalletAccount | undefined {
    const walletAccounts = this.fromBalancesToWalletAccount(balances);
    return walletAccounts?.find((wa: IWalletAccount) => wa.accountType === WalletAccountType.CONTRACT);
  }

  fromWalletDataToWalletAccount(walletData: IWalletData): IWalletAccount {
    if (walletData.accountType && walletData.coin) {
      return walletData as IWalletAccount;
    }

    if (walletData && 'marginCoin' in walletData) {
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
    return { accountType: '', coin: [] };
  }
}
