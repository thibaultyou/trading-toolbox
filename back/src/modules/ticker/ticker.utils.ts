import { ITickerData } from '@exchange/types/ticker-data.interface';

export const fromTickerDataToPrice = (data: ITickerData): number | null => {
  const bid = data.bid1Price || data.bidPr;
  const ask = data.ask1Price || data.askPr;

  if (bid && ask) {
    return (parseFloat(bid) + parseFloat(ask)) / 2;
  }
  return null;
};

export const haveTickerDataChanged = (existingData: ITickerData, newData: ITickerData): boolean => {
  const oldPrice = fromTickerDataToPrice(existingData);
  const newPrice = fromTickerDataToPrice(newData);
  return oldPrice !== newPrice;
};

export const haveTickerSetsChanged = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return true;

  for (const a of setA) {
    if (!setB.has(a)) return true;
  }
  return false;
};
