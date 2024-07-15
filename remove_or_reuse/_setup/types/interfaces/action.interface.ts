import { IOrderDetails } from '../../../order/types/order-details.interface';
import { ActionStatus, ActionType } from '../enums/action-types.enum';

export interface IAction {
  id: string;
  status: ActionStatus;
  type: ActionType;
  orderDetails: IOrderDetails;
}
