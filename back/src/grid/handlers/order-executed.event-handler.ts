import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../app.constants';
import { OrderExecutedEvent } from '../../exchange/events/order-executed.event';
import { GridService } from '../grid.service';

@Injectable()
export class OrderExecutedHandler {
  private readonly logger = new Logger(OrderExecutedHandler.name);

  constructor(private readonly gridService: GridService) { }

  @OnEvent(Events.ORDER_EXECUTED)
  async handle(event: OrderExecutedEvent) {
    try {
      const { accountName, data } = event;
      for (const orderData of data) {
        await this.gridService.updateGrid(accountName, orderData);
        this.logger.log(
          `[${Events.ORDER_EXECUTED}] [${accountName}] | ` +
          `Order ID: ${orderData.orderId} | ` +
          `Type: ${orderData.orderType} | ` +
          `Side: ${orderData.side} | ` +
          `Quantity: ${orderData.orderQty} | ` +
          `Symbol: ${orderData.symbol} | ` +
          `Price: ${orderData.orderPrice}$ | ` +
          `Fee: ${orderData.execFee}$`,
        );
      }
    } catch (error) {
      this.logger.error('Error handling OrderExecutedEvent', error.stack);
    }
  }
}
