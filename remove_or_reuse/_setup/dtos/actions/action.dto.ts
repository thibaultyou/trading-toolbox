import { ApiProperty } from '@nestjs/swagger';

import { ActionStatus, ActionType } from '../../types/enums/action-types.enum';
import { IAction } from '../../types/interfaces/action.interface';
import { OrderDetailsDto } from '../orders/order-details.dto';

export class ActionDto implements IAction {
  @ApiProperty({
    description: 'Unique identifier for the action',
    example: 'action123'
  })
  id: string;

  @ApiProperty({
    description: 'Current status of the action',
    example: ActionStatus.Waiting
  })
  status: ActionStatus;

  @ApiProperty({
    description: 'Type of action to be performed',
    example: ActionType.PlaceOrder
  })
  type: ActionType;

  @ApiProperty({
    description: 'Details of the action',
    type: OrderDetailsDto
  })
  orderDetails: OrderDetailsDto;
}
