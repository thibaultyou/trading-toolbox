import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlertReceivedEvent } from './events/alert-received.event';

@Injectable()
export class AlertService {
    constructor(
        private eventEmitter: EventEmitter2,
    ) { }

    notify(test: string): void {
        this.eventEmitter.emit('alert.received', new AlertReceivedEvent(test));
    }
}
