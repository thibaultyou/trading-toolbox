import { SetupStatus } from '../enums/setup-status.enum';
import { IAction } from './action.interface';
import { ICondition } from './condition.interface';
import { IOrderTracking } from './order-tracking.interface';
import { IPositionTracking } from './position-tracking.interface';
import { IRetryPolicy } from './retry-policy.interface';

export interface ISetup {
  id: string;
  status: SetupStatus;
  retryPolicy?: IRetryPolicy;
  activationCondition?: ICondition;
  entryCondition?: ICondition;
  exitCondition?: ICondition;
  actions: IAction[];
  positionTracking?: IPositionTracking;
  ordersTracking?: IOrderTracking[];
}
