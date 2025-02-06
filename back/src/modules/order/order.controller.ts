import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AccountValidationGuard } from '@account/guards/account-validation.guard';
import { BaseController } from '@common/base.controller';
import { ValidateAccount } from '@common/decorators/account-validation.decorator';
import { Urls } from '@config';
import { JwtAuthGuard } from '@user/guards/jwt-auth.guard';

import { OrderCreateRequestDto } from './dtos/order-create.request.dto';
import { OrderUpdateRequestDto } from './dtos/order-update.request.dto';
import { OrderDto } from './dtos/order.dto';
import { OrderService } from './order.service';
import { OrderMapperService } from './services/order-mapper.service';
import { OrderSide } from './types/order-side.enum';
import { OrderType } from './types/order-type.enum';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard, AccountValidationGuard)
@ApiBearerAuth()
@Controller(Urls.ORDERS)
export class OrderController extends BaseController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderMapper: OrderMapperService
  ) {
    super('Orders');
  }

  @Get('/accounts/:accountId/orders')
  @ValidateAccount()
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
  ): Promise<OrderDto[]> {
    const orders = await this.orderService.getOrders(accountId, marketId);
    return orders.map((order) => this.orderMapper.toDto(order));
  }

  @Get('/accounts/:accountId/orders/open')
  @ValidateAccount()
  @ApiOperation({ summary: 'Fetch all open orders' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiQuery({
    name: 'marketId',
    required: false,
    description: 'Optional ID of the market symbol to filter orders (e.g., BTCUSDT)'
  })
  getAccountOpenOrders(@Param('accountId') accountId: string, @Query('marketId') marketId?: string): OrderDto[] {
    const openOrders = this.orderService.getOpenOrders(accountId, marketId);
    return openOrders.map((order) => this.orderMapper.toDto(order));
  }

  @Get('/accounts/:accountId/orders/closed')
  @ValidateAccount()
  @ApiOperation({ summary: 'Fetch all closed orders' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiQuery({
    name: 'marketId',
    required: false,
    description: 'Optional ID of the market symbol to filter orders (e.g., BTCUSDT)'
  })
  async getAccountClosedOrders(
    @Param('accountId') accountId: string,
    @Query('marketId') marketId?: string
  ): Promise<OrderDto[]> {
    const closedOrders = await this.orderService.getClosedOrders(accountId, marketId);
    return closedOrders.map((order) => this.orderMapper.toDto(order));
  }

  @Post('/accounts/:accountId/orders')
  @ValidateAccount()
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
  ): Promise<OrderDto> {
    const createdOrder = await this.orderService.createOrder(accountId, createOrderRequestDto);
    return this.orderMapper.toDto(createdOrder);
  }

  @Get('/accounts/:accountId/markets/:marketId/orders/:orderId')
  @ValidateAccount()
  @ApiOperation({ summary: 'Fetch an Order by ID' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({ name: 'marketId', required: true, description: 'The ID of the market symbol' })
  @ApiParam({ name: 'orderId', required: true, description: 'The ID of the order to retrieve' })
  async getAccountOrderById(
    @Param('accountId') accountId: string,
    @Param('marketId') marketId: string,
    @Param('orderId') orderId: string
  ): Promise<OrderDto> {
    const order = await this.orderService.getOrderById(accountId, marketId, orderId);
    return this.orderMapper.toDto(order);
  }

  @Patch('/accounts/:accountId/orders/:orderId')
  @ValidateAccount()
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
  ): Promise<OrderDto> {
    const updatedOrder = await this.orderService.updateOrder(accountId, orderId, updateOrderDto);
    return this.orderMapper.toDto(updatedOrder);
  }

  @Delete('/accounts/:accountId/orders/:orderId')
  @ValidateAccount()
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({
    name: 'accountId',
    required: true,
    description: 'The ID of the account for which the order will be canceled'
  })
  @ApiParam({ name: 'orderId', required: true, description: 'The ID of the order to cancel' })
  async cancelOrder(@Param('accountId') accountId: string, @Param('orderId') orderId: string): Promise<OrderDto> {
    const cancelledOrder = await this.orderService.cancelOrder(accountId, orderId);
    return this.orderMapper.toDto(cancelledOrder);
  }

  @Delete('/accounts/:accountId/markets/:marketId/orders')
  @ValidateAccount()
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
  ): Promise<OrderDto[]> {
    const cancelledOrders = await this.orderService.cancelOrdersByMarket(accountId, marketId);
    return cancelledOrders.map((order) => this.orderMapper.toDto(order));
  }
}
