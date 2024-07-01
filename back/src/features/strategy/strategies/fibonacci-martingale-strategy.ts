import { Logger } from '@nestjs/common';

import { IExecutionData } from '../../core/types/execution-data.interface';
import { CurrencyMode } from '../types/currency-mode.enum';
import { IFibonacciMartingaleStrategyOptions } from '../types/options/fibonacci-martingale-strategy-options.interface';
import { IStrategy } from '../types/strategy.interface';
import { StrategyType } from '../types/strategy-type.enum';
import { BaseStrategy } from './base-strategy';

export class FibonacciMartingaleStrategy extends BaseStrategy {
  protected readonly logger = new Logger(FibonacciMartingaleStrategy.name);

  isFibonacciMartingaleOptions(options: any): options is IFibonacciMartingaleStrategyOptions {
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

  async process(accountId: string, strategy: IStrategy, executionData?: IExecutionData): Promise<void> {
    this.logger.debug(
      `Processing Fibonacci Martingale Strategy - AccountID: ${accountId} - StrategyID: ${strategy.id}`
    );

    if (!this.validateStrategyOptions(StrategyType.FIBONACCI_MARTINGALE, strategy.options)) {
      this.logger.warn(`Invalid strategy options - AccountID: ${accountId} - StrategyID: ${strategy.id}`);
      return;
    }

    if (!this.isFibonacciMartingaleOptions(strategy.options)) {
      this.logger.warn(`Invalid strategy options type - AccountID: ${accountId} - StrategyID: ${strategy.id}`);
      return;
    }

    if (strategy.orders.length === 0) {
      const {
        baseOrderSize,
        safetyOrderSize,
        safetyOrderStepScale,
        safetyOrderVolumeScale,
        initialSafetyOrderDistancePct,
        takeProfitPercentage,
        maxSafetyOrdersCount,
        currencyMode
      } = strategy.options;
      const marketId = strategy.marketId;
      const calculateOrderSize = (size: number, price: number) =>
        currencyMode === CurrencyMode.BASE ? size : size / price;
      const baseOrderPrice = await this.tickerService.getTickerPrice(accountId, marketId);

      if (baseOrderPrice) {
        // Place base order
        const baseOrderSizeInBase = calculateOrderSize(baseOrderSize, baseOrderPrice);
        // const baseOrder = await this.orderService.createOrder(accountId, {
        //   marketId: marketId,
        //   type: OrderType.MARKET,
        //   side: OrderSide.BUY,
        //   quantity: baseOrderSizeInBase
        // });
        // strategy.orders.push(baseOrder.id);
        this.logOrder(currencyMode, marketId, 'Base Order', baseOrderPrice, baseOrderSizeInBase);

        // Place take profit order
        const takeProfitPrice = baseOrderPrice * (1 + takeProfitPercentage / 100);
        // const takeProfitOrder = await this.orderService.createOrder(accountId, {
        //   marketId: marketId,
        //   type: OrderType.LIMIT,
        //   side: OrderSide.SELL,
        //   quantity: baseOrderSize,
        //   price: takeProfitPrice
        // });
        // strategy.takeProfitOrderId = takeProfitOrder.id;
        // strategy.orders.push(takeProfitOrder.id);
        this.logOrder(
          currencyMode,
          marketId,
          'Take Profit Order',
          takeProfitPrice,
          baseOrderSizeInBase,
          takeProfitPercentage
        );

        // Place safety orders
        let currentDeviation = initialSafetyOrderDistancePct;
        let currentSafetyOrderSize = safetyOrderSize;
        for (let i = 0; i < maxSafetyOrdersCount; i++) {
          const safetyOrderPrice = baseOrderPrice * (1 - currentDeviation / 100);
          const safetyOrderSizeInBase = calculateOrderSize(currentSafetyOrderSize, safetyOrderPrice);
          //   const safetyOrder = await this.orderService.createOrder(accountId, {
          //     marketId: marketId,
          //     type: OrderType.LIMIT,
          //     side: OrderSide.BUY,
          //     quantity: safetyOrderSizeInBase,
          //     price: safetyOrderPrice
          //   });
          //   strategy.orders.push(safetyOrder.id);
          this.logOrder(
            currencyMode,
            marketId,
            `Safety Order ${i + 1}`,
            safetyOrderPrice,
            safetyOrderSizeInBase,
            currentDeviation
          );

          currentSafetyOrderSize *= safetyOrderVolumeScale;
          currentDeviation = currentDeviation * safetyOrderStepScale + initialSafetyOrderDistancePct;
        }

        this.logger.log(
          `Placed all orders for Fibonacci Martingale Strategy - AccountID: ${accountId} - StrategyID: ${strategy.id} - MarketID: ${marketId}`
        );
      } else {
        this.logger.warn(
          `Failed to get base order price - AccountID: ${accountId} - StrategyID: ${strategy.id} - MarketID: ${marketId}`
        );
      }
    } else {
      this.logger.warn(
        `Existing orders found, MISSING logic here - AccountID: ${accountId} - StrategyID: ${strategy.id}`
      );
      // TODO: Implement logic for handling existing orders
    }
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
