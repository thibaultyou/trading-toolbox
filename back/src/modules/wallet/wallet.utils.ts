import { ICoinData } from './types/coin-data.interface';
import { IWalletAccount } from './types/wallet-account.interface';

export const extractUSDTEquity = (walletAccount: IWalletAccount): number => {
  if (!walletAccount) {
    return 0;
  }

  const usdtCoin: ICoinData | undefined = walletAccount.coin.find((c) => c.coin === 'USDT');

  if (!usdtCoin || usdtCoin.equity === undefined) {
    return 0;
  }

  const parsedEquity = parseFloat(usdtCoin.equity);

  if (isNaN(parsedEquity)) {
    return 0;
  }
  return parsedEquity;
};
