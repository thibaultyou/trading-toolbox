import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { IAccountTracker } from '../../common/types/account-tracker.interface';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { OrderService } from '../order/order.service';
import { ActionStatus, ActionType } from './types/enums/action-types.enum';
import { SetupStatus } from './types/enums/setup-status.enum';
import { ISetup } from './types/interfaces/setup.interface';

@Injectable()
export class SetupService implements OnModuleInit, IAccountTracker {
  private logger = new Logger(SetupService.name);
  private trackedSetups: Map<string, ISetup[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private orderService: OrderService
  ) {}

  async onModuleInit() {
    // TODO remove
    // const setup: ISetup = {
    //   id: '1',
    //   status: SetupStatus.WaitingForActivation,
    //   // retryPolicy: {
    //   //   maxAttempts: 1
    //   // },
    //   // activationCondition: undefined,
    //   // entryCondition: {
    //   //   type: ConditionType.PriceBelow,
    //   //   referenceValue: 0.61
    //   // },
    //   // exitCondition: undefined,
    //   actions: [
    //     {
    //       id: '123',
    //       status: ActionStatus.Waiting,
    //       type: ActionType.PlaceOrder,
    //       orderDetails: {
    //         marketId: 'FTMUSDT',
    //         type: OrderType.LIMIT,
    //         quantity: 10,
    //         price: 0.3,
    //         side: OrderSide.BUY
    //       }
    //     }
    //   ]
    //   // positionTracking: undefined,
    //   // ordersTracking: []
    // };
    // await this.createSetup('1660782b-9765-4ede-9f0f-94d235bbc170', setup);
    //
    // setInterval(() => {
    //   this.refreshAll();
    // }, 15000);
  }

  async startTrackingAccount(accountId: string) {
    if (!this.trackedSetups.has(accountId)) {
      this.logger.log(`Tracking Initiated - AccountID: ${accountId}`);
      //   await this.refreshOne(accountId);
    } else {
      this.logger.warn(`Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.trackedSetups.delete(accountId)) {
      this.logger.log(`Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  async createSetup(accountId: string, setupData: ISetup): Promise<ISetup> {
    this.logger.log(`Setup - Create Initiated - AccountID: ${accountId}`);

    // TODO save as entity

    const setups = this.trackedSetups.get(accountId) || [];
    setups.push(setupData);
    this.trackedSetups.set(accountId, setups);

    // this.eventEmitter.emit('setup.created', new SetupCreatedEvent(accountId, setupData));
    this.logger.warn(
      `Setup - Created - AccountID: ${accountId}, SetupID: ${setupData.id}, Details: ${JSON.stringify(setupData)}`
    );
    return setupData;
  }

  //   async updateSetup(accountId: string, setupId: string, updateData: Partial<ISetup>): Promise<ISetup> {
  //     this.logger.log(`Updating setup with ID: ${setupId} for account ID: ${accountId}`);
  //     const setups = this.trackedSetups.get(accountId);
  //     if (!setups) {
  //         throw new AccountNotFoundException(`No setups found for account ID: ${accountId}`);
  //     }

  //     const setup = setups.find(s => s.id === setupId);
  //     if (!setup) {
  //         throw new Error(`Setup not found with ID: ${setupId}`);
  //     }

  //     Object.assign(setup, updateData);
  //     // this.eventEmitter.emit('setup.updated', new SetupUpdatedEvent(accountId, setup));
  //     this.logger.log(`Setup updated with ID: ${setupId}`);
  //     return setup;
  // }

  async getSetupsForAccount(accountId: string): Promise<ISetup[]> {
    this.logger.log(`Fetching setups for account ID: ${accountId}`);
    const setups = this.trackedSetups.get(accountId) || [];

    if (!setups.length) {
      throw new AccountNotFoundException(`No setups found for account ID: ${accountId}`);
    }
    return setups;
  }

  async refreshAll() {
    this.logger.log(`All Setups - Refresh Initiated`);
    const accountIds = Array.from(this.trackedSetups.keys());
    for (const accountId of accountIds) {
      const setups = this.trackedSetups.get(accountId);
      setups.forEach(async (setup) => {
        try {
          switch (setup.status) {
            case SetupStatus.WaitingForActivation:
              // check activation condition
              if (!setup.activationCondition) {
                setup.status = SetupStatus.Activated;
                this.logger.log(`Setup - Activated - AccountID: ${accountId}, SetupID: ${setup.id}`);
              }

              // or if activation condition is valid
              // activate setup
              break;

            case SetupStatus.WaitingForRetry:
              // check retry policy
              // check reactivation condition if any
              // if no condition or reactivation condition is valid
              break;

            case SetupStatus.Activated:
              // TODO check entry conditions
              // if no condition
              // TODO or entry conditions are valid
              // execute actions
              // update status to running
              // increase attempts
              if (!setup.entryCondition) {
                setup.actions.forEach(async (action) => {
                  if (action.status === ActionStatus.Waiting) {
                    switch (action.type) {
                      case ActionType.PlaceOrder:
                        try {
                          await this.orderService.createOrder(accountId, {
                            marketId: action.orderDetails.marketId,
                            type: action.orderDetails.type,
                            side: action.orderDetails.side,
                            quantity: action.orderDetails.quantity,
                            price: action.orderDetails.price,
                            takeProfitPrice: action.orderDetails.takeProfitPrice,
                            stopLossPrice: action.orderDetails.stopLossPrice
                          });
                          action.status = ActionStatus.Completed;
                          this.logger.log(
                            `Action - Executed - AccountID: ${accountId}, SetupID: ${setup.id}, ActionID: ${action.id}`
                          );
                        } catch (error) {
                          this.logger.error(
                            `Action - Execution Failed - AccountID: ${accountId}, SetupID: ${setup.id}, ActionID: ${action.id}, Error: ${error.message}`,
                            error.stack
                          );
                        }

                        break;
                      // TODO
                    }
                  }
                });
                setup.status = SetupStatus.Running;
                this.logger.log(`Setup - Running - AccountID: ${accountId}, SetupID: ${setup.id}`);
              }

              break;

            case SetupStatus.Running:
              // check exit conditions
              // if no condition or exit conditions are valid
              // close position and orders
              // if retry policy then check retry policy
              // if attempts < maxAttempts
              // update status to waiting for retry
              // else
              // update status to completed
              // else
              // update status to completed
              break;
          }
        } catch (error) {
          this.logger.error(
            `Setup - Refresh Failed - AccountID: ${accountId}, SetupID: ${setup.id}, Error: ${error.message}`,
            error.stack
          );
        }
      });
    }
  }
}

// async deleteSetup(accountId: string, setupId: string): Promise<void> {
//     this.logger.log(`Deleting setup with ID: ${setupId} for account ID: ${accountId}`);
//     const setups = this.trackedSetups.get(accountId);
//     if (!setups) {
//         throw new AccountNotFoundException(`No setups found for account ID: ${accountId}`);
//     }

//     const index = setups.findIndex(s => s.id === setupId);
//     if (index === -1) {
//         throw new Error(`Setup not found with ID: ${setupId}`);
//     }

//     setups.splice(index, 1);
//     this.trackedSetups.set(accountId, setups);
//     this.eventEmitter.emit('setup.deleted', new SetupDeletedEvent(accountId, setupId));
//     this.logger.log(`Setup deleted with ID: ${setupId}`);
// }
