export enum ActionType {
  MARKET_LONG = 'MARKET_LONG',
  MARKET_SHORT = 'MARKET_SHORT',
  MARKET_CLOSE = 'MARKET_CLOSE',
  UPDATE_SL = 'UPDATE_SL',
  UPDATE_TP = 'UPDATE_TP',
}

export enum TriggerType {
  CROSSING = 'CROSSING',
}

export enum StatusType {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  PAUSED = 'PAUSED',
}
