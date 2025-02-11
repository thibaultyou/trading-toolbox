export const fromSymbolToMarketId = (symbol: string): string => {
  const parts = symbol.split(':')[0].split('/');
  return parts.join('');
};
