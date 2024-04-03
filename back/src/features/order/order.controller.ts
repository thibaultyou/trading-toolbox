import { Body, Controller, Get, NotFoundException, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { BaseController } from '../../common/base/base.controller';
import { OrderCreateRequestDto } from './dto/order-create.request.dto';
import { OrderCreateResponseDto } from './dto/order-create.response.dto';
import { OrderReadResponseDto } from './dto/order-read.response.dto';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
export class OrderController extends BaseController {
  constructor(private readonly orderService: OrderService) {
    super('Orders');
  }

  @Get('/:accountId')
  @ApiOperation({ summary: 'Fetch all orders' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiQuery({ name: 'marketId', required: false, description: 'Optional market ID to filter orders' })
  async getAccountOrders(
    @Param('accountId') accountId: string,
    @Query('marketId') marketId?: string
  ): Promise<OrderReadResponseDto[]> {
    return (await this.orderService.getAccountOrders(accountId, marketId)).map(
      (order) => new OrderReadResponseDto(order)
    );
  }

  @Get('/:accountId/open')
  @ApiOperation({ summary: 'Fetch all open orders' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiQuery({
    name: 'marketId',
    required: false,
    description: 'Optional trading symbol to filter orders (e.g., BTCUSDT)'
  })
  getAccountOpenOrders(
    @Param('accountId') accountId: string,
    @Query('marketId') marketId?: string
  ): OrderReadResponseDto[] {
    return this.orderService.getAccountOpenOrders(accountId, marketId).map((order) => new OrderReadResponseDto(order));
  }

  @Get('/:accountId/:marketId/:orderId')
  @ApiOperation({ summary: 'Fetch a single order' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiParam({
    name: 'marketId',
    required: true,
    description: 'The ID of the trading symbol to filter orders (e.g., BTCUSDT)'
  })
  @ApiParam({ name: 'orderId', required: true, description: 'The ID of the order to retrieve' })
  async getAccountOrderById(
    @Param('accountId') accountId: string,
    @Param('marketId') marketId: string,
    @Param('orderId') orderId: string
  ): Promise<OrderReadResponseDto> {
    const order = await this.orderService.getAccountOrderById(accountId, marketId, orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found for account ${accountId}`);
    }

    return new OrderReadResponseDto(order);
  }

  @Post('/:accountId')
  @ApiOperation({ summary: 'Create an order for a specific account' })
  @ApiParam({ name: 'accountId', required: true, description: 'The ID of the account' })
  @ApiBody({
    description: 'Order creation details',
    type: OrderCreateRequestDto,
    examples: {
      aLimitOrder: {
        summary: 'Limit Order',
        value: {
          symbol: 'FTMUSDT',
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
          symbol: 'FTMUSDT',
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
  ): Promise<OrderCreateResponseDto[]> {
    return (await this.orderService.createOrder(accountId, createOrderRequestDto)).map(
      (o) => new OrderCreateResponseDto(o)
    );
  }
}
