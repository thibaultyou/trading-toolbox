import { ICondition } from './condition.interface';

export interface IRetryPolicy {
  maxAttempts: number;
  attempts: number;
  reactivationCondition?: ICondition;
}
