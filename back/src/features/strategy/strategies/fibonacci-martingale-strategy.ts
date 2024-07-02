import { Logger } from '@nestjs/common';

import { IExecutionData } from '../../core/types/execution-data.interface';
import { OrderSide } from '../../order/types/order-side.enum';
import { OrderType } from '../../order/types/order-type.enum';
import { calculateOrderSize } from '../strategy.utils';
import { IFibonacciMartingaleStrategyOptions } from '../types/options/fibonacci-martingale-strategy-options.interface';
import { IStrategy } from '../types/strategy.interface';
import { StrategyType } from '../types/strategy-type.enum';
import { BaseStrategy } from './base-strategy';

export class FibonacciMartingaleStrategy extends BaseStrategy {
  protected readonly logger = new Logger(FibonacciMartingaleStrategy.name);

  async process(accountId: string, strategy: IStrategy, _executionData?: IExecutionData) {
    this.logger.debug(`Processing strategy - AccountID: ${accountId} - StrategyID: ${strategy.id}`);

    try {
      if (!this.validateStrategy(strategy)) {
        return;
      }

      const options = strategy.options as IFibonacciMartingaleStrategyOptions;
      const marketId = strategy.marketId;

      if (strategy.orders.length === 0) {
        await this.placeInitialOrders(accountId, strategy, options, marketId);
      } else {
        await this.handleExistingOrders(accountId, strategy);
      }
    } catch (error) {
      this.logger.error(
        `Strategy processing failed - AccountID: ${accountId} - StrategyID: ${strategy.id} - Error: ${error.message}`,
        error.stack
      );
    }
  }

  private validateStrategy(strategy: IStrategy): boolean {
    this.logger.debug(`Validating strategy - StrategyID: ${strategy.id}`);

    if (!this.validateStrategyOptions(StrategyType.FIBONACCI_MARTINGALE, strategy.options)) {
      this.logger.warn(`Invalid strategy options - StrategyID: ${strategy.id}`);
      return false;
    }

    if (!this.isFibonacciMartingaleOptions(strategy.options)) {
      this.logger.warn(`Invalid strategy options type - StrategyID: ${strategy.id}`);
      return false;
    }

    this.logger.debug(`Strategy validated successfully - StrategyID: ${strategy.id}`);
    return true;
  }

  private isFibonacciMartingaleOptions(options: any): options is IFibonacciMartingaleStrategyOptions {
    return (
      'baseOrderSize' in options &&
      'safetyOrderSize' in options &&
      'safetyOrderStepScale' in options &&
      'safetyOrderVolumeScale' in options &&
      'initialSafetyOrderDistancePct' in options &&
      'takeProfitPercentage' in options &&
      'maxSafetyOrdersCount' in options &&
      'currencyMode' in options
    );
  }

  private async placeInitialOrders(
    accountId: string,
    strategy: IStrategy,
    options: IFibonacciMartingaleStrategyOptions,
    marketId: string
  ) {
    this.logger.debug(
      `Placing initial orders - AccountID: ${accountId} - StrategyID: ${strategy.id} - MarketID: ${marketId}`
    );

    const baseOrderPrice = await this.tickerService.getTickerPrice(accountId, marketId);

    if (!baseOrderPrice) {
      this.logger.warn(
        `Failed to get base order price - AccountID: ${accountId} - StrategyID: ${strategy.id} - MarketID: ${marketId}`
      );
      return;
    }

    // await this.placeBaseOrder(accountId, strategy, options, marketId, baseOrderPrice);
    // await this.placeTakeProfitOrder(accountId, strategy, options, marketId, baseOrderPrice);
    // await this.placeSafetyOrders(accountId, strategy, options, marketId, baseOrderPrice);

    this.logger.log(
      `Placed all initial orders - AccountID: ${accountId} - StrategyID: ${strategy.id} - MarketID: ${marketId}`
    );
  }

  private async placeBaseOrder(
    accountId: string,
    strategy: IStrategy,
    options: IFibonacciMartingaleStrategyOptions,
    marketId: string,
    baseOrderPrice: number
  ) {
    this.logger.debug(
      `Placing base order - AccountID: ${accountId} - StrategyID: ${strategy.id} - MarketID: ${marketId}`
    );

    const baseOrderSizeInBase = calculateOrderSize(options.baseOrderSize, baseOrderPrice, options.currencyMode);
    const baseOrder = await this.orderService.createOrder(accountId, {
      marketId: marketId,
      type: OrderType.MARKET,
      side: OrderSide.BUY,
      quantity: baseOrderSizeInBase
    });
    strategy.orders.push(baseOrder.id);
    this.logOrder(options.currencyMode, marketId, 'Base Order', baseOrderPrice, baseOrderSizeInBase);

    this.logger.debug(
      `Placed base order - AccountID: ${accountId} - StrategyID: ${strategy.id} - OrderID: ${baseOrder.id}`
    );
  }

  private async placeTakeProfitOrder(
    accountId: string,
    strategy: IStrategy,
    options: IFibonacciMartingaleStrategyOptions,
    marketId: string,
    baseOrderPrice: number
  ) {
    this.logger.debug(
      `Placing take profit order - AccountID: ${accountId} - StrategyID: ${strategy.id} - MarketID: ${marketId}`
    );

    const takeProfitPrice = baseOrderPrice * (1 + options.takeProfitPercentage / 100);
    const takeProfitOrder = await this.orderService.createOrder(accountId, {
      marketId: marketId,
      type: OrderType.LIMIT,
      side: OrderSide.SELL,
      quantity: options.baseOrderSize,
      price: takeProfitPrice
    });
    strategy.takeProfitOrderId = takeProfitOrder.id;
    strategy.orders.push(takeProfitOrder.id);
    this.logOrder(
      options.currencyMode,
      marketId,
      'Take Profit Order',
      takeProfitPrice,
      options.baseOrderSize,
      options.takeProfitPercentage
    );

    this.logger.debug(
      `Placed take profit order - AccountID: ${accountId} - StrategyID: ${strategy.id} - OrderID: ${takeProfitOrder.id}`
    );
  }

  private async placeSafetyOrders(
    accountId: string,
    strategy: IStrategy,
    options: IFibonacciMartingaleStrategyOptions,
    marketId: string,
    baseOrderPrice: number
  ) {
    this.logger.debug(
      `Placing safety orders - AccountID: ${accountId} - StrategyID: ${strategy.id} - MarketID: ${marketId}`
    );

    let currentDeviation = options.initialSafetyOrderDistancePct;
    let currentSafetyOrderSize = options.safetyOrderSize;
    for (let i = 0; i < options.maxSafetyOrdersCount; i++) {
      const safetyOrderPrice = baseOrderPrice * (1 - currentDeviation / 100);
      const safetyOrderSizeInBase = calculateOrderSize(currentSafetyOrderSize, safetyOrderPrice, options.currencyMode);
      const safetyOrder = await this.orderService.createOrder(accountId, {
        marketId: marketId,
        type: OrderType.LIMIT,
        side: OrderSide.BUY,
        quantity: safetyOrderSizeInBase,
        price: safetyOrderPrice
      });
      strategy.orders.push(safetyOrder.id);
      this.logOrder(
        options.currencyMode,
        marketId,
        `Safety Order ${i + 1}`,
        safetyOrderPrice,
        safetyOrderSizeInBase,
        currentDeviation
      );

      this.logger.debug(
        `Placed safety order ${i + 1} - AccountID: ${accountId} - StrategyID: ${strategy.id} - OrderID: ${safetyOrder.id}`
      );

      currentSafetyOrderSize *= options.safetyOrderVolumeScale;
      currentDeviation = currentDeviation * options.safetyOrderStepScale + options.initialSafetyOrderDistancePct;
    }

    this.logger.debug(
      `Placed all safety orders - AccountID: ${accountId} - StrategyID: ${strategy.id} - Count: ${options.maxSafetyOrdersCount}`
    );
  }

  private async handleExistingOrders(accountId: string, strategy: IStrategy) {
    this.logger.warn(
      `Existing orders found, MISSING logic here - AccountID: ${accountId} - StrategyID: ${strategy.id}`
    );
    // TODO: Implement logic for handling existing orders
  }
}

// Commented out code remains unchanged

// else {
//   // If a safety order is executed, update the take profit order
//   const executedOrder = strategy.orders.find(order => order.id === executionData.orderId);
//   if (executedOrder && executedOrder.side === OrderSide.BUY) {
//     const executedOrders = strategy.orders.filter(order => order.side === OrderSide.BUY && order.status === 'closed');
//     const totalAmount = executedOrders.reduce((sum, order) => sum + order.amount, 0);
//     const averagePrice = executedOrders.reduce((sum, order) => sum + order.price * order.amount, 0) / totalAmount;
//     const newTakeProfitPrice = averagePrice * (1 + takeProfitPercentage / 100);

//     if (strategy.takeProfitOrder) {
//       await this.orderService.cancelOrder(accountId, strategy.takeProfitOrder.id);
//     }

//     const newTakeProfitOrder = await this.orderService.createOrder(accountId, {
//       marketId: symbol,
//       type: OrderType.LIMIT,
//       side: OrderSide.SELL,
//       quantity: totalAmount,
//       price: newTakeProfitPrice
//     });
//     const internalNewTakeProfitOrder = fromOrdertoInternalOrder(newTakeProfitOrder);
//     strategy.takeProfitOrder = internalNewTakeProfitOrder;
//     strategy.orders.push(internalNewTakeProfitOrder);
//     this.logger.log(`Strategy - Take Profit Order Updated - ${JSON.stringify(internalNewTakeProfitOrder)}`);
//   }
// }
