import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';
import { ExchangeInitializedEvent } from '@exchange/events/exchange-initialized.event';

import { OrderService } from '../order.service';

@Injectable()
export class OrderModuleExchangeInitializedEventHandler {
  private logger = new Logger(EventHandlersContext.OrderModule);

  constructor(private orderService: OrderService) {}

  @OnEvent(Events.Exchange.INITIALIZED)
  async handle(event: ExchangeInitializedEvent) {
    const accountId = event.accountId;
    const actionContext = `${Events.Exchange.INITIALIZED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      await this.orderService.startTrackingAccount(accountId);
      this.logger.log(`handle() - success | ${actionContext}, tracking=started`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
