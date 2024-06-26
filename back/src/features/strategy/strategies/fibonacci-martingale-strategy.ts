import { Logger } from '@nestjs/common';

import { IExecutionData } from '../../core/types/execution-data.interface';
import { CurrencyMode } from '../types/currency-mode.enum';
import { IStrategy } from '../types/strategy.interface';
import { BaseStrategy } from './base-strategy';

export class FibonacciMartingaleStrategy extends BaseStrategy {
  protected readonly logger = new Logger(FibonacciMartingaleStrategy.name);

  async process(accountId: string, strategy: IStrategy): Promise<void> {
    this.logger.log(
      `Strategy - Processing Fibonacci Martingale Strategy - AccountID: ${accountId}, StrategyID: ${strategy.id}`
    );

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
        this.logOrder(currencyMode, marketId, 'Base Order Placed', baseOrderPrice, baseOrderSizeInBase);

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
          'Take Profit Order Placed',
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
            `Safety Order ${i + 1} Placed`,
            safetyOrderPrice,
            safetyOrderSizeInBase,
            currentDeviation
          );

          currentSafetyOrderSize *= safetyOrderVolumeScale;
          currentDeviation = currentDeviation * safetyOrderStepScale + initialSafetyOrderDistancePct;
        }
      }
    } else {
      this.logger.log(`StrategyExisting orders found, implementing update logic`);
      // TODO: Implement logic for handling existing orders
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

  async handleOrderExecution(accountId: string, strategy: IStrategy, executionData: IExecutionData) {
    this.logger.log(
      `Strategy - Updating Orders - AccountID: ${accountId}, StrategyID: ${strategy.id}, OrderID: ${executionData.orderId}`
    );

    const executedOrderIndex = strategy.orders.findIndex((id) => id === executionData.orderId);

    if (executedOrderIndex !== -1) {
      strategy.orders.splice(executedOrderIndex, 1);

      if (strategy.takeProfitOrderId === executionData.orderId) {
        this.logger.log(`Strategy - Take Profit Order Executed - AccountID: ${accountId}, StrategyID: ${strategy.id}`);
        strategy.takeProfitOrderId = undefined;
      }

      await this.process(accountId, strategy);
    }
  }
}
