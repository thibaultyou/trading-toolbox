import { Logger } from '@nestjs/common';

import { ICoinData } from '../types/coin-data.interface';
import { IWalletAccount } from '../types/wallet-account.interface';

export function extractUSDTEquity(walletAccount: IWalletAccount, logger: Logger): number | null {
  let usdtEquity: number | null = null;
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
}
