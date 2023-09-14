export type Position = {
  info: {
    [index: string]: string;
  };
  id: string | undefined;
  symbol: string;
  contracts: number;
  contractSize: number | undefined;
  entryPrice: number;
  collateral: number | undefined;
  side: 'long' | 'short';
  unrealizedProfit: number | undefined;
  leverage: number;
  percentage: number | undefined;
  marginType: string;
  notional: number | undefined;
  markPrice: number | undefined;
  lastPrice: number | undefined;
  liquidationPrice: number;
  initialMargin: number;
  initialMarginPercentage: number | undefined;
  maintenanceMargin: number | undefined;
  maintenanceMarginPercentage: number | undefined;
  marginRatio: number | undefined;
  timestamp: number;
  datetime: string;
  lastUpdateTimestamp: number | undefined;
};
