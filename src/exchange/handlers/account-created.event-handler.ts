import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AccountCreatedEvent } from '../../account/events/account-created.event';

@EventsHandler(AccountCreatedEvent)
export class AccountCreatedHandler implements IEventHandler<AccountCreatedEvent> {
    handle(event: AccountCreatedEvent) {
        console.log(`Account created: ${event.name}`);
    }
}
