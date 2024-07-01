import { Logger } from '@nestjs/common';
import { Balances } from 'ccxt';

import { IWalletData } from '../core/types/wallet-data.interface';
import { ICoinData } from './types/coin-data.interface';
import { IWalletAccount } from './types/wallet-account.interface';
import { WalletAccountType } from './types/wallet-account-type.enum';

export const fromBalancestoWalletAccount = (balances: Balances): IWalletAccount[] => balances.info?.result?.list;

export const fromWalletDataToWalletAccount = (walletData: IWalletData): IWalletAccount => walletData;

export const fromBalancesToWalletContractAccount = (balances: Balances): IWalletAccount =>
  fromBalancestoWalletAccount(balances).find(
    (walletAccount: IWalletAccount) => walletAccount.accountType === WalletAccountType.CONTRACT
  );

export const extractUSDTEquity = (walletAccount: IWalletAccount, logger: Logger): number => {
  let usdtEquity: number = 0;
  const usdtCoinObject = walletAccount?.coin.find((coin: ICoinData) => coin.coin === 'USDT');

  if (usdtCoinObject?.equity !== undefined) {
    const parsedEquity = parseFloat(usdtCoinObject.equity);

    if (!isNaN(parsedEquity)) {
      usdtEquity = parsedEquity;
    } else {
      logger.warn(`USDT equity found but could not be parsed to a number`);
    }
  } else {
    logger.warn(`USDT equity not found or is undefined`);
  }
  return usdtEquity;
};
