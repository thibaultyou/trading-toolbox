import { IOrderDetails } from '../../../order/types/order-details.interface';
import { OrderStatus } from '../enums/order-status.enum';

export interface IOrderTracking {
  orderId: string;
  marketId: string;
  status: OrderStatus;
  relatedSetupId: string;
  details: IOrderDetails;
}
