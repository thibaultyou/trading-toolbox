import { Logger } from '@nestjs/common';

import { IExecutionData } from '@exchange/types/execution-data.interface';
import { OrderSide } from '@order/types/order-side.enum';
import { OrderType } from '@order/types/order-type.enum';

import { BaseStrategy } from './base-strategy';
import { calculateOrderSize } from '../strategy.utils';
import { IFibonacciMartingaleStrategyOptions } from '../types/options/fibonacci-martingale-strategy-options.interface';
import { StrategyType } from '../types/strategy-type.enum';
import { IStrategy } from '../types/strategy.interface';

export class FibonacciMartingaleStrategy extends BaseStrategy {
  protected readonly logger = new Logger(FibonacciMartingaleStrategy.name);

  async process(accountId: string, strategy: IStrategy, _executionData?: IExecutionData) {
    this.logger.debug(`process() - start | accountId=${accountId}, strategyId=${strategy.id}`);

    try {
      if (!this.validateStrategy(strategy)) {
        this.logger.warn(
          `process() - skip | reason=InvalidStrategyOptions, accountId=${accountId}, strategyId=${strategy.id}`
        );
        return;
      }

      const options = strategy.options as IFibonacciMartingaleStrategyOptions;
      const marketId = strategy.marketId;

      if (strategy.orders.length === 0) {
        await this.placeInitialOrders(accountId, strategy, options, marketId);
      } else {
        await this.handleExistingOrders(accountId, strategy);
      }

      this.logger.log(`process() - success | accountId=${accountId}, strategyId=${strategy.id}`);
    } catch (error) {
      this.logger.error(
        `process() - error | accountId=${accountId}, strategyId=${strategy.id}, msg=${error.message}`,
        error.stack
      );
    }
  }

  private validateStrategy(strategy: IStrategy): boolean {
    this.logger.debug(`validateStrategy() - start | strategyId=${strategy.id}, type=${strategy.type}`);

    if (!this.validateStrategyOptions(StrategyType.FIBONACCI_MARTINGALE, strategy.options)) {
      this.logger.warn(`validateStrategy() - fail | reason=InvalidFibonacciOptions, strategyId=${strategy.id}`);
      return false;
    }

    if (!this.isFibonacciMartingaleOptions(strategy.options)) {
      this.logger.warn(`validateStrategy() - fail | reason=OptionsTypeMismatch, strategyId=${strategy.id}`);
      return false;
    }

    this.logger.debug(`validateStrategy() - success | strategyId=${strategy.id}`);
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
      `placeInitialOrders() - start | accountId=${accountId}, strategyId=${strategy.id}, marketId=${marketId}`
    );

    const baseOrderPrice = await this.tickerService.getTickerPrice(accountId, marketId);

    if (!baseOrderPrice) {
      this.logger.warn(
        `placeInitialOrders() - skip | reason=NoTickerPrice, accountId=${accountId}, strategyId=${strategy.id}, marketId=${marketId}`
      );
      return;
    }

    // Example placeholders (uncomment to actually create base, TP, safety orders):
    // await this.placeBaseOrder(accountId, strategy, options, marketId, baseOrderPrice);
    // await this.placeTakeProfitOrder(accountId, strategy, options, marketId, baseOrderPrice);
    // await this.placeSafetyOrders(accountId, strategy, options, marketId, baseOrderPrice);

    this.logger.log(
      `placeInitialOrders() - success | accountId=${accountId}, strategyId=${strategy.id}, marketId=${marketId}`
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
      `placeBaseOrder() - start | accountId=${accountId}, strategyId=${strategy.id}, marketId=${marketId}`
    );

    const baseOrderSizeInBase = calculateOrderSize(options.baseOrderSize, baseOrderPrice, options.currencyMode);
    const baseOrder = await this.orderService.createOrder(accountId, {
      marketId,
      type: OrderType.MARKET,
      side: OrderSide.BUY,
      quantity: baseOrderSizeInBase
    });
    strategy.orders.push(baseOrder.id);
    this.logOrder(options.currencyMode, marketId, 'BaseOrder', baseOrderPrice, baseOrderSizeInBase);

    this.logger.log(
      `placeBaseOrder() - success | accountId=${accountId}, strategyId=${strategy.id}, orderId=${baseOrder.id}`
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
      `placeTakeProfitOrder() - start | accountId=${accountId}, strategyId=${strategy.id}, marketId=${marketId}`
    );

    const takeProfitPrice = baseOrderPrice * (1 + options.takeProfitPercentage / 100);
    const takeProfitOrder = await this.orderService.createOrder(accountId, {
      marketId,
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
      'TakeProfitOrder',
      takeProfitPrice,
      options.baseOrderSize,
      options.takeProfitPercentage
    );

    this.logger.log(
      `placeTakeProfitOrder() - success | accountId=${accountId}, strategyId=${strategy.id}, orderId=${takeProfitOrder.id}`
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
      `placeSafetyOrders() - start | accountId=${accountId}, strategyId=${strategy.id}, marketId=${marketId}`
    );

    let currentDeviation = options.initialSafetyOrderDistancePct;
    let currentSafetyOrderSize = options.safetyOrderSize;
    for (let i = 0; i < options.maxSafetyOrdersCount; i++) {
      const safetyOrderPrice = baseOrderPrice * (1 - currentDeviation / 100);
      const safetyOrderSizeInBase = calculateOrderSize(currentSafetyOrderSize, safetyOrderPrice, options.currencyMode);
      const safetyOrder = await this.orderService.createOrder(accountId, {
        marketId,
        type: OrderType.LIMIT,
        side: OrderSide.BUY,
        quantity: safetyOrderSizeInBase,
        price: safetyOrderPrice
      });
      strategy.orders.push(safetyOrder.id);
      this.logOrder(
        options.currencyMode,
        marketId,
        `SafetyOrder${i + 1}`,
        safetyOrderPrice,
        safetyOrderSizeInBase,
        currentDeviation
      );

      this.logger.log(
        `placeSafetyOrders() - info | accountId=${accountId}, strategyId=${strategy.id}, safetyOrderIndex=${i + 1}, orderId=${safetyOrder.id}`
      );

      currentSafetyOrderSize *= options.safetyOrderVolumeScale;
      currentDeviation = currentDeviation * options.safetyOrderStepScale + options.initialSafetyOrderDistancePct;
    }

    this.logger.log(
      `placeSafetyOrders() - success | accountId=${accountId}, strategyId=${strategy.id}, count=${options.maxSafetyOrdersCount}`
    );
  }

  private async handleExistingOrders(accountId: string, strategy: IStrategy) {
    this.logger.warn(`handleExistingOrders() - not implemented | accountId=${accountId}, strategyId=${strategy.id}`);
    // TODO: Implement your logic for existing orders
  }
}

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
