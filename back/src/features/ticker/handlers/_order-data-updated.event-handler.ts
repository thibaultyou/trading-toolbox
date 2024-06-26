// import { Injectable, Logger } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';

// import { EventHandlersContext, Events } from '../../../config';
// import { OrderDataUpdatedEvent } from '../../core/events/order-data-updated.event';
// import { TickerService } from '../ticker.service';

// @Injectable()
// export class TickerModuleOrderDataUpdatedEventHandler {
//   private logger = new Logger(EventHandlersContext.TickerModuleEventHandler);

//   constructor(private tickerService: TickerService) {}

//   @OnEvent(Events.ORDER_DATA_UPDATED)
//   async handle(event: OrderDataUpdatedEvent) {
//     const actionContext = `${Events.ORDER_DATA_UPDATED} | AccountID: ${event.accountId}`;

//     try {
//       const refreshPromises = event.data.map(() => this.tickerService.refreshOne(event.accountId));
//       await Promise.all(refreshPromises);
//       this.logger.log(actionContext);
//     } catch (error) {
//       this.logger.error(
//         `${actionContext} - Failed to process order update data - Error: ${error.message}`,
//         error.stack
//       );
//     }
//   }
// }
