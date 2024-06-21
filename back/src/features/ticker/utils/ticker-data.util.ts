import { TickerData } from '../ticker.types';

export const getPriceFromTickerData = (data: TickerData): number | null => {
  const { bid1Price, ask1Price } = data;

  if (bid1Price && ask1Price) {
    return (parseFloat(bid1Price) + parseFloat(ask1Price)) / 2;
  }
  return null;
};

export const hasTickerDataChanged = (existingData: TickerData, newData: TickerData): boolean =>
  Object.entries(newData).some(([key, value]) => existingData[key] !== value);
