import { Logger } from '@nestjs/common';
import { Balances } from 'ccxt';

export function extractUSDTEquity(balances: Balances, logger: Logger): number | null {
  let usdtEquity: number | null = null;
  const usdtCoinObject = balances.info?.result?.list[0]?.coin.find((coin: any) => coin.coin === 'USDT');

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
