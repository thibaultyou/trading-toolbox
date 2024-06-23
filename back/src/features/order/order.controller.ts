import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { OrderCreateRequestDto } from './dto/order-create.request.dto';
import { OrderCreateResponseDto } from './dto/order-create.response.dto';
import { OrderDeleteResponseDto } from './dto/order-delete.response.dto';
import { OrderReadResponseDto } from './dto/order-read.response.dto';
import { OrderUpdateRequestDto } from './dto/order-update.request.dto';
import { OrderUpdateResponseDto } from './dto/order-update.response.dto';
import { OrderService } from './order.service';
import { OrderSide, OrderType } from './order.types';

// TODO add create many
// TODO add cancel many

@ApiTags('Orders')
@Controller('orders')
export class OrderController extends BaseController {
  constructor(private readonly orderService: OrderService) {
    super('Orders');
  }

  @Get('/accounts/:accountId/orders')
  @ApiOperation({ summary: 'Fetch all orders' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiQuery({
    name: 'marketId',
    required: false,
    description: 'Optional ID of the market symbol to filter orders (e.g., BTCUSDT)'
  })
  async getAccountOrders(
    @Param('accountId') accountId: string,
    @Query('marketId') marketId?: string
  ): Promise<OrderReadResponseDto[]> {
    return (await this.orderService.getAccountOrders(accountId, marketId)).map(
      (order) => new OrderReadResponseDto(order)
    );
  }

  @Get('/accounts/:accountId/orders/open')
  @ApiOperation({ summary: 'Fetch all open orders' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiQuery({
    name: 'marketId',
    required: false,
    description: 'Optional ID of the market symbol to filter orders (e.g., BTCUSDT)'
  })
  getAccountOpenOrders(
    @Param('accountId') accountId: string,
    @Query('marketId') marketId?: string
  ): OrderReadResponseDto[] {
    return this.orderService.getAccountOpenOrders(accountId, marketId).map((order) => new OrderReadResponseDto(order));
  }

  @Post('/accounts/:accountId/orders')
  @ApiOperation({ summary: 'Create an order' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiBody({
    description: 'Order creation details',
    type: OrderCreateRequestDto,
    examples: {
      aLimitOrder: {
        summary: 'Limit Order',
        value: {
          marketId: 'FTMUSDT',
          orderLinkId: '1234567890',
          type: OrderType.LIMIT,
          side: OrderSide.BUY,
          quantity: 1,
          price: 0.3,
          takeProfitPrice: 0.6,
          stopLossPrice: 0.1
        }
      },
      aMarketOrder: {
        summary: 'Market Order',
        value: {
          marketId: 'FTMUSDT',
          orderLinkId: '1234567890',
          type: OrderType.MARKET,
          side: OrderSide.SELL,
          quantity: 1,
          takeProfitPrice: 0.6,
          stopLossPrice: 0.1
        }
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrder(
    @Param('accountId') accountId: string,
    @Body() createOrderRequestDto: OrderCreateRequestDto
  ): Promise<OrderCreateResponseDto> {
    return new OrderCreateResponseDto(await this.orderService.createOrder(accountId, createOrderRequestDto));
  }

  @Get('/accounts/:accountId/orders/:orderId')
  @ApiOperation({ summary: 'Fetch an Order by ID' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({ name: 'orderId', required: true, description: 'The ID of the order to retrieve' })
  async getAccountOrderById(
    @Param('accountId') accountId: string,
    @Param('orderId') orderId: string
  ): Promise<OrderReadResponseDto> {
    return new OrderReadResponseDto(await this.orderService.getAccountOrderById(accountId, orderId));
  }

  @Patch('/accounts/:accountId/orders/:orderId')
  @ApiOperation({ summary: 'Update an order' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({ name: 'orderId', required: true, description: 'The ID of the order to update' })
  @ApiBody({
    description: 'Order update details',
    type: OrderUpdateRequestDto
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateOrder(
    @Param('accountId') accountId: string,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: OrderUpdateRequestDto
  ): Promise<OrderUpdateResponseDto> {
    return new OrderUpdateResponseDto(await this.orderService.updateOrder(accountId, orderId, updateOrderDto));
  }

  @Delete('/accounts/:accountId/orders/:orderId')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({
    name: 'accountId',
    required: true,
    description: 'The ID of the account for which the order will be canceled'
  })
  @ApiParam({ name: 'orderId', required: true, description: 'The ID of the order to cancel' })
  async cancelOrder(
    @Param('accountId') accountId: string,
    @Param('orderId') orderId: string
  ): Promise<OrderDeleteResponseDto> {
    return new OrderDeleteResponseDto(await this.orderService.cancelOrder(accountId, orderId));
  }

  @Delete('/accounts/:accountId/ordersByMarket/:marketId')
  @ApiOperation({ summary: 'Cancel multiple orders by market ID' })
  @ApiParam({
    name: 'accountId',
    required: true,
    description: 'The ID of the account for which the order will be canceled'
  })
  @ApiParam({
    name: 'marketId',
    required: true,
    description: 'The ID of the market symbol to filter orders (e.g., BTCUSDT)'
  })
  async cancelOrdersByMarket(
    @Param('accountId') accountId: string,
    @Param('marketId') marketId: string
  ): Promise<OrderDeleteResponseDto[]> {
    return (await this.orderService.cancelOrdersByMarket(accountId, marketId)).map(
      (order) => new OrderDeleteResponseDto(order)
    );
  }
}
