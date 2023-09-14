import { StatusType, TriggerType } from './common.types';

export interface Action {
  id?: string;
  order: number;
  type: ActionType;
  value: string;
  value_type: ValueType;
  trigger: TriggerType;
  trigger_value?: string;
  status?: StatusType;
  take_profit?: string;
  stop_loss?: string;
}

export enum ActionType {
  MARKET_LONG = 'MARKET_LONG',
  MARKET_SHORT = 'MARKET_SHORT',
  MARKET_CLOSE = 'MARKET_CLOSE',
  UPDATE_SL = 'UPDATE_SL',
  UPDATE_TP = 'UPDATE_TP',
}

export enum ValueType {
  CONTRACTS = 'CONTRACTS',
  COST = 'COST',
  PERCENTAGE = 'PERCENTAGE',
}