import { Logger } from '@nestjs/common';

import { ICoinData } from './types/coin-data.interface';
import { IWalletAccount } from './types/wallet-account.interface';

export class WalletUtils {
  private static readonly logger = new Logger(WalletUtils.name);

  static extractUSDTEquity(walletAccount: IWalletAccount): number {
    const usdtCoinObject = walletAccount?.coin.find((coin: ICoinData) => coin.coin === 'USDT');

    if (usdtCoinObject?.equity !== undefined) {
      const parsedEquity = parseFloat(usdtCoinObject.equity);

      if (!isNaN(parsedEquity)) {
        return parsedEquity;
      } else {
        this.logger.warn(`USDT equity found but could not be parsed to a number`);
      }
    } else {
      this.logger.warn(`USDT equity not found or is undefined`);
    }
    return 0;
  }
}
