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

  @Get('/:accountName')
  @ApiOperation({ summary: 'Fetch all orders for a specific account' })
  async findAccountOrders(
    @Param('accountName') accountName: string,
  ): Promise<Order[]> {
    return await this.orderService.getOrders(accountName);
  }

  @Get('/:accountName/:symbol')
  @ApiOperation({ summary: 'Fetch orders for a specific account and symbol' })
  async findAccountOrdersBySymbol(
    @Param('accountName') accountName: string,
    @Param('symbol') symbol: string,
  ): Promise<Order[]> {
    return await this.orderService.getOrders(accountName, symbol);
  }
}
