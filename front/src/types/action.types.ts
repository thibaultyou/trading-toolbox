import { StatusType, TriggerType } from './common.types';

export interface Action {
  id?: string;
  order: number;
  type: ActionType;
  value: string;
  trigger: TriggerType;
  trigger_value?: string;
  status?: StatusType;
}

export enum ActionType {
  MARKET_LONG = 'MARKET_LONG',
  MARKET_SHORT = 'MARKET_SHORT',
  MARKET_CLOSE = 'MARKET_CLOSE',
  UPDATE_SL = 'UPDATE_SL',
  UPDATE_TP = 'UPDATE_TP',
}
