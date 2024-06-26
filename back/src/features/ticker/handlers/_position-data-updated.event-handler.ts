// import { Injectable, Logger } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';

// import { EventHandlersContext, Events } from '../../../config';
// import { TickerService } from '../ticker.service';
// import { PositionDataUpdatedEvent } from '../../core/events/position-data-updated.event';

// @Injectable()
// export class TickerModulePositionDataUpdatedEventHandler {
//   private logger = new Logger(EventHandlersContext.TickerModuleEventHandler);

//   constructor(private tickerService: TickerService) {}

//   @OnEvent(Events.POSITION_DATA_UPDATED)
//   async handle(event: PositionDataUpdatedEvent) {
//     const actionContext = `${Events.POSITION_DATA_UPDATED} | AccountID: ${event.accountId}`;

//     try {
//       for (const _ of event.data) {
//         this.tickerService.refreshOne(event.accountId);
//       }
//       this.logger.log(actionContext);
//     } catch (error) {
//       this.logger.error(
//         `${actionContext} - Failed to process order update data - Error: ${error.message}`,
//         error.stack
//       );
//     }
//   }
// }
