import { IOrderDetails } from '../../../order/order.interfaces';
import { ActionStatus, ActionType } from '../enums/action-types.enum';

export interface IAction {
  id: string;
  status: ActionStatus;
  type: ActionType;
  orderDetails: IOrderDetails;
}
