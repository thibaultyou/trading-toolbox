import { ApiProperty } from '@nestjs/swagger';

import { SetupStatus } from '../types/enums/setup-status.enum';
import { ISetup } from '../types/interfaces/setup.interface';
import { ActionDto } from './actions/action.dto';
import { ConditionDto } from './conditions/condition.dto';
import { RetryPolicyDto } from './policies/retry-policy.dto';
import { OrderTrackingDto } from './tracking/order-tracking.dto';
import { PositionTrackingDto } from './tracking/position-tracking.dto';

export class SetupReadResponseDto implements ISetup {
  @ApiProperty({
    description: 'Unique identifier for the setup',
    example: 'setup789'
  })
  id: string;

  @ApiProperty({
    description: 'Current status of the setup',
    example: 'active'
  })
  status: SetupStatus;

  @ApiProperty({
    description: 'Retry policy details',
    type: RetryPolicyDto,
    required: false
  })
  retryPolicy?: RetryPolicyDto;

  @ApiProperty({
    description: 'Activation condition for the setup',
    type: ConditionDto,
    required: false
  })
  activationCondition?: ConditionDto;

  @ApiProperty({
    description: 'Entry condition for the setup',
    type: ConditionDto,
    required: false
  })
  entryCondition?: ConditionDto;

  @ApiProperty({
    description: 'Exit condition for the setup',
    type: ConditionDto,
    required: false
  })
  exitCondition?: ConditionDto;

  @ApiProperty({
    description: 'List of actions associated with the setup',
    type: [ActionDto]
  })
  actions: ActionDto[];

  @ApiProperty({
    description: 'Position tracking information',
    type: PositionTrackingDto,
    required: false
  })
  positionTracking?: PositionTrackingDto;

  @ApiProperty({
    description: 'List of orders being tracked by the setup',
    type: [OrderTrackingDto],
    required: false
  })
  ordersTracking?: OrderTrackingDto[];

  constructor(setup: ISetup) {
    this.id = setup.id;
    this.status = setup.status;

    this.retryPolicy = setup.retryPolicy
      ? {
          maxAttempts: setup.retryPolicy.maxAttempts,
          attempts: setup.retryPolicy.attempts,
          reactivationCondition: setup.retryPolicy.reactivationCondition
            ? {
                type: setup.retryPolicy.reactivationCondition.type,
                referenceValue: setup.retryPolicy.reactivationCondition.referenceValue
              }
            : undefined
        }
      : undefined;

    this.activationCondition = setup.activationCondition
      ? {
          type: setup.activationCondition.type,
          referenceValue: setup.activationCondition.referenceValue
        }
      : undefined;

    this.entryCondition = setup.entryCondition
      ? {
          type: setup.entryCondition.type,
          referenceValue: setup.entryCondition.referenceValue
        }
      : undefined;

    this.exitCondition = setup.exitCondition
      ? {
          type: setup.exitCondition.type,
          referenceValue: setup.exitCondition.referenceValue
        }
      : undefined;

    this.actions = setup.actions.map((action) => ({
      id: action.id,
      status: action.status,
      type: action.type,
      orderDetails: {
        type: action.orderDetails.type,
        side: action.orderDetails.side,
        quantity: action.orderDetails.quantity,
        marketId: action.orderDetails.marketId,
        price: action.orderDetails.price,
        takeProfitPrice: action.orderDetails.takeProfitPrice,
        stopLossPrice: action.orderDetails.stopLossPrice
      }
    }));

    this.positionTracking = setup.positionTracking
      ? {
          positionId: setup.positionTracking.positionId,
          marketId: setup.positionTracking.marketId,
          status: setup.positionTracking.status
        }
      : undefined;

    this.ordersTracking = setup.ordersTracking
      ? setup.ordersTracking.map((order) => ({
          orderId: order.orderId,
          marketId: order.marketId,
          relatedSetupId: order.relatedSetupId,
          status: order.status,
          details: {
            marketId: order.details.marketId,
            side: order.details.side,
            type: order.details.type,
            quantity: order.details.quantity,
            price: order.details.price,
            takeProfitPrice: order.details.takeProfitPrice,
            stopLossPrice: order.details.stopLossPrice
          }
        }))
      : undefined;
  }
}
