import { ITickerData } from '../core/types/ticker-data.interface';

export const fromTickerDataToPrice = (data: ITickerData): number | null => {
  const { bid1Price, ask1Price } = data;

  if (bid1Price && ask1Price) {
    return (parseFloat(bid1Price) + parseFloat(ask1Price)) / 2;
  }
  return null;
};

export const haveTickerDataChanged = (existingData: ITickerData, newData: ITickerData): boolean =>
  Object.entries(newData).some(([key, value]) => existingData[key] !== value);

export const haveTickerSetsChanged = (setA: Set<string>, setB: Set<string>): boolean => {
  if (setA.size !== setB.size) return true;

  for (const a of setA) {
    if (!setB.has(a)) return true;
  }
  return false;
};
