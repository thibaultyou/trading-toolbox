import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Events } from '../../config';
import { OrderExecutedEvent } from '../../features/exchange/events/order-executed.event';
import { GridService } from '../grid.service';

@Injectable()
export class OrderExecutedHandler {
  private readonly logger = new Logger(OrderExecutedHandler.name);

  constructor(private readonly gridService: GridService) {}

  @OnEvent(Events.ORDER_EXECUTED)
  async handle(event: OrderExecutedEvent) {
    try {
      const { accountName, data } = event;
      for (const orderData of data) {
        await this.gridService.updateGrid(accountName, orderData);
        this.logger.log(
          `Executed order | ` +
            `Account: ${accountName} | ` +
            `Ticker: ${orderData.symbol} | ` +
            `Type: ${orderData.orderType} | ` +
            `Side: ${orderData.side} | ` +
            `Qty: ${orderData.orderQty} | ` +
            `Price: ${orderData.orderPrice}$ | ` +
            `Fee: ${orderData.execFee}$`,
        );
      }
    } catch (error) {
      this.logger.error('Error handling OrderExecutedEvent', error.stack);
    }
  }
}
