export const convertSymbolToMarketId = (symbol: string): string => {
  const parts = symbol.split(':')[0].split('/');
  return parts.join('');
};

export const convertMarketIdToBaseToken = (marketId: string, quote: string = 'USDT'): string => {
  const quoteRegExp = new RegExp(`${quote}$`);
  return marketId.replace(quoteRegExp, '');
};
