// // alert.service.ts

// import { Injectable, Logger } from '@nestjs/common';
// import { EventEmitter2 } from '@nestjs/event-emitter';

// import { Setup } from '../_setup/entities/setup.entity';
// import { Events } from '../config';
// import { ReceiveAlertDto } from './dto/receive-alert.dto';
// import { AlertReceivedEvent } from './events/alert-received.event';
// import { AlertReceiveException } from './exceptions/alert.exceptions';

// @Injectable()
// export class AlertService {
//   private logger = new Logger(AlertService.name);

//   constructor(private eventEmitter: EventEmitter2) {}

//   notify(alertData: ReceiveAlertDto): void {
//     try {
//       const setup = new Setup();

//       Object.assign(setup, alertData);
//       this.logger.log(`Notifying alert with market: ${setup.market}`);
//       this.eventEmitter.emit(
//         Events.ALERT_RECEIVED,
//         new AlertReceivedEvent(setup),
//       );
//     } catch (error) {
//       this.logger.error(
//         `Error notifying alert with market: ${alertData.market}`,
//         error.stack,
//       );
//       throw new AlertReceiveException(error.message);
//     }
//   }
// }
