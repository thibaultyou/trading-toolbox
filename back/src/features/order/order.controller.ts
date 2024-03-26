import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Order } from 'ccxt';

import { BaseController } from '../../common/base/base.controller';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
export class OrderController extends BaseController {
  constructor(private readonly orderService: OrderService) {
    super('Orders');
  }

  @Get('/:accountId')
  @ApiOperation({ summary: 'Fetch all orders for a specific account' })
  getAccountOrders(@Param('accountId') accountId: string): Order[] {
    return this.orderService.getAccountOrders(accountId);
  }
}
