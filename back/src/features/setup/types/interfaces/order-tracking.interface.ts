import { IOrderDetails } from 'src/features/order/order.interfaces';

import { OrderStatus } from '../enums/order-status.enum';

export interface IOrderTracking {
  orderId: string;
  marketId: string;
  status: OrderStatus;
  relatedSetupId: string;
  details: IOrderDetails;
}
