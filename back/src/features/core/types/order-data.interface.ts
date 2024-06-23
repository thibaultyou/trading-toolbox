export interface IOrderData {
    avgPrice: string;
    cumExecQty: string;
    orderId: string;
    orderStatus: string;
    orderLinkId: string;
    orderType: string;
    price: string;
    qty: string;
    side: string;
    symbol: string;
    // blockTradeId: string;
    // cancelType: string;
    // category: string;
    // closeOnTrigger: boolean;
    // createdTime: string;
    // cumExecFee: string;
    // cumExecValue: string;
    // leavesQty: string;
    // leavesValue: string;
    // orderIv: string;
    // isLeverage: string;
    // lastPriceOnCreated: string;
    // positionIdx: number;
    // reduceOnly: boolean;
    // rejectReason: string;
    // slTriggerBy: string;
    // stopLoss: string;
    // stopOrderType: string;
    // takeProfit: string;
    // timeInForce: string;
    // tpTriggerBy: string;
    // triggerBy: string;
    // triggerDirection: number;
    // triggerPrice: string;
    // updatedTime: string;
    // placeType: string;
    // smpType: string;
    // smpGroup: number;
    // smpOrderId: string;
    // tpslMode: string;
    // createType: string;
    // tpLimitPrice: string;
    // slLimitPrice: string;
}

// sample order
// {
//   "avgPrice": "0.5941",
//   "blockTradeId": "",
//   "cancelType": "UNKNOWN",
//   "category": "linear",
//   "closeOnTrigger": false,
//   "createdTime": "1719181270937",
//   "cumExecFee": "0.00326755",
//   "cumExecQty": "10",
//   "cumExecValue": "5.941",
//   "leavesQty": "0",
//   "leavesValue": "0",
//   "orderId": "5ce2d55d-c6c1-45f9-9e4c-01acadebf1be",
//   "orderIv": "",
//   "isLeverage": "",
//   "lastPriceOnCreated": "0.5940",
//   "orderStatus": "Filled",
//   "orderLinkId": "",
//   "orderType": "Market",
//   "positionIdx": 1,
//   "price": "0.6237",
//   "qty": "10",
//   "reduceOnly": false,
//   "rejectReason": "EC_NoError",
//   "side": "Buy",
//   "slTriggerBy": "UNKNOWN",
//   "stopLoss": "0.0000",
//   "stopOrderType": "UNKNOWN",
//   "symbol": "FTMUSDT",
//   "takeProfit": "0.0000",
//   "timeInForce": "IOC",
//   "tpTriggerBy": "UNKNOWN",
//   "triggerBy": "UNKNOWN",
//   "triggerDirection": 0,
//   "triggerPrice": "0.0000",
//   "updatedTime": "1719181270938",
//   "placeType": "",
//   "smpType": "None",
//   "smpGroup": 0,
//   "smpOrderId": "",
//   "tpslMode": "UNKNOWN",
//   "createType": "CreateByUser",
//   "tpLimitPrice": "",
//   "slLimitPrice": ""
// }