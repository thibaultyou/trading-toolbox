export interface IPositionData {
  entryPrice: string;
  leverage: string;
  positionValue: string;
  side: string;
  symbol: string;
  unrealisedPnl: string;
  markPrice: string;
  size: string;
  takeProfit: string;
  stopLoss: string;
  // bustPrice: string;
  // category: string;
  // createdTime: string;
  // cumRealisedPnl: string;
  // curRealisedPnl: string;
  // liqPrice: string;
  // positionBalance: string;
  // positionIdx: number;
  // positionMM: string;
  // positionIM: string;
  // positionStatus: string;
  // riskId: number;
  // riskLimitValue: string;
  tpslMode: string;
  // tradeMode: number;
  // autoAddMargin: number;
  // trailingStop: string;
  // updatedTime: string;
  // adlRankIndicator: number;
  // seq: number;
  // isReduceOnly: boolean;
  // mmrSysUpdateTime: string;
  // leverageSysUpdatedTime: string;
}

// sample position
// {
//   "bustPrice": "0.0001",
//   "category": "linear",
//   "createdTime": "1652063737916",
//   "cumRealisedPnl": "-63.46131007",
//   "curRealisedPnl": "-0.00326755",
//   "entryPrice": "0.5941",
//   "leverage": "50",
//   "liqPrice": "",
//   "markPrice": "0.5944",
//   "positionBalance": "0.1220222",
//   "positionIdx": 1,
//   "positionMM": "0.0000075",
//   "positionIM": "0.0790153",
//   "positionStatus": "Normal",
//   "positionValue": "5.941",
//   "riskId": 581,
//   "riskLimitValue": "200000",
//   "side": "Buy",
//   "size": "10",
//   "stopLoss": "0.0000",
//   "symbol": "FTMUSDT",
//   "takeProfit": "0.0000",
//   "tpslMode": "Full",
//   "tradeMode": 0,
//   "autoAddMargin": 0,
//   "trailingStop": "0.0000",
//   "unrealisedPnl": "0.003",
//   "updatedTime": "1719181270938",
//   "adlRankIndicator": 2,
//   "seq": 107793890205,
//   "isReduceOnly": false,
//   "mmrSysUpdateTime": "",
//   "leverageSysUpdatedTime": ""
// }
