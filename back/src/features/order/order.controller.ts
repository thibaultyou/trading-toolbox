import { Body, Controller, Delete, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { OrderCreateRequestDto } from './dto/order-create.request.dto';
import { OrderCreateResponseDto } from './dto/order-create.response.dto';
import { OrderDeleteResponseDto } from './dto/order-delete.response.dto';
import { OrderReadResponseDto } from './dto/order-read.response.dto';
import { OrderService } from './order.service';

// TODO add order update
// TODO add create many
// TODO add cancel many

@ApiTags('Orders')
@Controller('orders')
export class OrderController extends BaseController {
  constructor(private readonly orderService: OrderService) {
    super('Orders');
  }

  @Get('/:accountId')
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

  @Post('/:accountId')
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
          side: 'buy',
          volume: 1,
          price: 0.9666,
          stopLossPrice: 0.95,
          takeProfitPrice: 1.06
        }
      },
      aMarketOrder: {
        summary: 'Market Order',
        value: {
          marketId: 'FTMUSDT',
          side: 'sell',
          volume: 1
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

  @Get('/:accountId/open')
  @ApiOperation({ summary: 'Fetch all open orders' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({
    name: 'marketId',
    required: true,
    description: 'The ID of the market symbol to filter orders (e.g., BTCUSDT)'
  })
  @ApiParam({ name: 'orderId', required: true, description: 'The ID of the order to retrieve' })
  async getAccountOrderById(
    @Param('accountId') accountId: string,
    @Param('marketId') marketId: string,
    @Param('orderId') orderId: string
  ): Promise<OrderReadResponseDto> {
    return new OrderReadResponseDto(await this.orderService.getAccountOrderById(accountId, marketId, orderId));
  }

  @Delete('/:accountId/:marketId/:orderId')
  @ApiOperation({ summary: 'Cancel an order' })
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
  @ApiParam({ name: 'orderId', required: true, description: 'The ID of the order to cancel' })
  async cancelOrder(
    @Param('accountId') accountId: string,
    @Param('marketId') marketId: string,
    @Param('orderId') orderId: string
  ): Promise<OrderDeleteResponseDto> {
    return new OrderDeleteResponseDto(await this.orderService.cancelOrder(accountId, marketId, orderId));
  }

  @Delete('/:accountId/:marketId')
  @ApiOperation({ summary: 'Cancel multiple orders' })
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
  async cancelOrders(
    @Param('accountId') accountId: string,
    @Param('marketId') marketId: string
  ): Promise<OrderDeleteResponseDto[]> {
    return (await this.orderService.cancelOrders(accountId, marketId)).map(
      (order) => new OrderDeleteResponseDto(order)
    );
  }
}
