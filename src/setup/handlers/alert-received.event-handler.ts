import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AlertReceivedEvent } from '../../alert/events/alert-received.event';
import { SetupService } from '../setup.service';

@EventsHandler(AlertReceivedEvent)
export class AlertReceivedHandler implements IEventHandler<AlertReceivedEvent> {
    constructor(private readonly setupService: SetupService) { }

    async handle(event: AlertReceivedEvent) {
        console.log(`Alert received: ${event}`);
        const setup = await this.setupService.create(event.test);
        console.log(`Setup created: ${setup.id}`);
    }
}