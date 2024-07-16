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

import { ValidateAccount } from '@account/decorators/account-validation.decorator';
import { AccountValidationGuard } from '@account/guards/account-validation.guard';
import { BaseController } from '@common/base.controller';
import { JwtAuthGuard } from '@user/guards/jwt-auth.guard';

import { OrderCreateRequestDto } from './dtos/order-create.request.dto';
import { OrderCreateResponseDto } from './dtos/order-create.response.dto';
import { OrderDeleteResponseDto } from './dtos/order-delete.response.dto';
import { OrderReadResponseDto } from './dtos/order-read.response.dto';
import { OrderUpdateRequestDto } from './dtos/order-update.request.dto';
import { OrderUpdateResponseDto } from './dtos/order-update.response.dto';
import { OrderService } from './order.service';
import { OrderSide } from './types/order-side.enum';
import { OrderType } from './types/order-type.enum';

// TODO add create many
// TODO add cancel many by order id

@ApiTags('Orders')
@UseGuards(JwtAuthGuard, AccountValidationGuard)
@ApiBearerAuth()
@Controller('orders')
export class OrderController extends BaseController {
  constructor(private readonly orderService: OrderService) {
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
  ): Promise<OrderReadResponseDto[]> {
    return (await this.orderService.getOrders(accountId, marketId)).map((order) => new OrderReadResponseDto(order));
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
  getAccountOpenOrders(
    @Param('accountId') accountId: string,
    @Query('marketId') marketId?: string
  ): OrderReadResponseDto[] {
    return this.orderService.getOpenOrders(accountId, marketId).map((order) => new OrderReadResponseDto(order));
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
  ): Promise<OrderCreateResponseDto> {
    return new OrderCreateResponseDto(await this.orderService.createOrder(accountId, createOrderRequestDto));
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
  ): Promise<OrderReadResponseDto> {
    return new OrderReadResponseDto(await this.orderService.getOrderById(accountId, marketId, orderId));
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
  ): Promise<OrderUpdateResponseDto> {
    return new OrderUpdateResponseDto(await this.orderService.updateOrder(accountId, orderId, updateOrderDto));
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
  async cancelOrder(
    @Param('accountId') accountId: string,
    @Param('orderId') orderId: string
  ): Promise<OrderDeleteResponseDto> {
    return new OrderDeleteResponseDto(await this.orderService.cancelOrder(accountId, orderId));
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
  ): Promise<OrderDeleteResponseDto[]> {
    return (await this.orderService.cancelOrdersByMarket(accountId, marketId)).map(
      (order) => new OrderDeleteResponseDto(order)
    );
  }
}
