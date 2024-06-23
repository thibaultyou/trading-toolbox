import { ITickerData } from "../core/types/ticker-data.interface";

export const getPriceFromTickerData = (data: ITickerData): number | null => {
  const { bid1Price, ask1Price } = data;

  if (bid1Price && ask1Price) {
    return (parseFloat(bid1Price) + parseFloat(ask1Price)) / 2;
  }
  return null;
};

export const hasTickerDataChanged = (existingData: ITickerData, newData: ITickerData): boolean =>
  Object.entries(newData).some(([key, value]) => existingData[key] !== value);
