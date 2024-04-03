import { Action } from './action.types';
import { StatusType, TriggerType } from './common.types';

export interface Setup {
  id?: string;
  ticker: string;
  account: string;
  trigger?: TriggerType;
  status: StatusType;
  value?: number;
  actions: Action[];
  retries: number;
}

export interface SetupRow extends Setup {
  index: number;
  open: boolean;
}
