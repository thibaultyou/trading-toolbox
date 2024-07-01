import { ApiProperty } from '@nestjs/swagger';

import { OrderStatus } from '../../types/enums/order-status.enum';
import { IOrderTracking } from '../../types/interfaces/order-tracking.interface';
import { OrderDetailsDto } from '../orders/order-details.dto';

export class OrderTrackingDto implements IOrderTracking {
  @ApiProperty({
    description: 'Identifier for the order',
    example: 'order456'
  })
  orderId: string;

  @ApiProperty({
    description: 'Market ID associated with the order',
    example: 'BTCUSDT'
  })
  marketId: string;

  @ApiProperty({
    description: 'Unique identifier for the related setup',
    example: 'setup789'
  })
  relatedSetupId: string;

  @ApiProperty({
    description: 'Current status of the order',
    example: 'filled'
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Details of the order',
    type: OrderDetailsDto
  })
  details: OrderDetailsDto;
}
