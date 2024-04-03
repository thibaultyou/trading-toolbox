import { Logger } from '@nestjs/common';
import ccxt, { Balances, Exchange, Market, Order, Position } from 'ccxt';

import { Account } from '../../account/entities/account.entity';
import { OrderSide, OrderType } from '../../order/order.types';
import {
  ExchangeOperationFailedException,
  ExchangeTerminationFailedException
} from '../exceptions/exchange.exceptions';
import { IExchangeService } from '../exchange.interfaces';

export abstract class AbstractExchangeService implements IExchangeService {
  protected readonly logger = new Logger(AbstractExchangeService.name);
  protected exchange: Exchange;
  protected readonly account: Account;

  constructor(account: Account) {
    this.account = account;
  }

  abstract initialize(): Promise<boolean>;

  async testCredentials(): Promise<void> {
    try {
      await this.exchange.fetchBalance();
    } catch (error) {
      const errMsg = `Credentials Verification Failed - Account: ${this.account.name}, Error: ${error.message}`;

      this.logger.error(errMsg, error.stack);

      if (error instanceof ccxt.AuthenticationError) {
        throw new ExchangeOperationFailedException('verifying credentials', errMsg);
      }

      throw new ExchangeOperationFailedException('verifying credentials', error.message);
    }
  }

  async getBalances(): Promise<Balances> {
    try {
      const balances = await this.exchange.fetchBalance();

      this.logger.log(`Fetched Balances Successfully - AccountID: ${this.account.id}`);

      return balances;
    } catch (error) {
      this.logger.error(`Failed to Fetch Balances - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('fetching balances', error.message);
    }
  }

  async getMarkets(): Promise<Market[]> {
    try {
      const markets = await this.exchange.fetchMarkets();

      this.logger.log(`Fetched Markets Successfully - AccountID: ${this.account.id}`);

      return markets;
    } catch (error) {
      this.logger.error(`Failed to Fetch Markets - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('fetching markets', error.message);
    }
  }

  async getOpenOrders(): Promise<Order[]> {
    try {
      const orders = await this.exchange.fetchOpenOrders();

      this.logger.log(`Fetched Open Orders Successfully - AccountID: ${this.account.id}`);

      return orders;
    } catch (error) {
      this.logger.error(`Failed to Fetch Open Orders - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('fetching open orders', error.message);
    }
  }

  async getOrders(symbol?: string): Promise<Order[]> {
    try {
      const orders = await this.exchange.fetchOrders(symbol, undefined, undefined, { orderIds: [] });

      this.logger.log(`Fetched Orders Successfully - AccountID: ${this.account.id}`);

      return orders;
    } catch (error) {
      this.logger.error(`Failed to Fetch Orders - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('fetching orders', error.message);
    }
  }

  async getOrder(orderId: string, symbol: string): Promise<Order> {
    try {
      // NOTE symbol is required on bybit
      const order = await this.exchange.fetchOrder(orderId, symbol);

      this.logger.log(
        `Fetched Order Successfully - AccountID: ${this.account.id}, OrderID: ${orderId}, MarketID: ${symbol}`
      );

      return order;
    } catch (error) {
      this.logger.error(
        `Failed to Fetch Order - AccountID: ${this.account.id}, OrderID: ${orderId}, MarketID: ${symbol}, Error: ${error.message}`
      );
      throw new ExchangeOperationFailedException('fetching order', error.message);
    }
  }

  async getOpenPositions(): Promise<Position[]> {
    try {
      const positions = await this.exchange.fetchPositions();

      this.logger.log(`Fetched Open Positions Successfully - AccountID: ${this.account.id}`);

      return positions;
    } catch (error) {
      this.logger.error(`Failed to Fetch Open Positions - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('fetching open positions', error.message);
    }
  }

  async openOrder(
    symbol: string,
    side: OrderSide,
    volume: number,
    price?: number,
    stopLossPrice?: number,
    takeProfitPrice?: number,
    params?: Record<string, any>
  ): Promise<Order[]> {
    this.logger.log(
      `Order Open Initiated - AccountID: ${this.account.id}, Symbol: ${symbol}, Side: ${side}, Volume: ${volume}${price ? `, Price: ${price}` : ''}${stopLossPrice ? `, Stop Loss: ${stopLossPrice}` : ''}${takeProfitPrice ? `, Take Profit: ${takeProfitPrice}` : ''}`
    );

    // TODO improve
    if (volume <= 0) {
      throw new Error('Volume must be greater than zero.');
    }

    if (price !== undefined && price <= 0) {
      throw new Error('Price must be greater than zero when specified.');
    }

    const orderType = price ? OrderType.Limit : OrderType.Market;
    let primaryOrder: Order;
    const additionalOrders: Order[] = [];

    try {
      // Create the primary order
      primaryOrder = await this.exchange.createOrder(symbol, orderType, side, volume, price, params);
      this.logger.log(
        `${orderType} Order Opened - OrderID: ${primaryOrder.id}, Side: ${side}, Symbol: ${symbol}, Volume: ${volume}, Price: ${price}`
      );

      // Handle stop loss and take profit
      if (stopLossPrice && takeProfitPrice) {
        // If both are specified, create them together (if supported)
        const tpAndSlOrder = await this.exchange.createOrderWithTakeProfitAndStopLoss(
          symbol,
          orderType,
          side,
          volume,
          price,
          takeProfitPrice,
          stopLossPrice,
          params
        );

        additionalOrders.push({ ...tpAndSlOrder, symbol });
      } else {
        if (stopLossPrice) {
          const slOrder = await this.exchange.createStopLossOrder(
            symbol,
            orderType,
            side,
            volume,
            price,
            stopLossPrice,
            params
          );

          additionalOrders.push({ ...slOrder, symbol });
        }

        if (takeProfitPrice) {
          const tpOrder = await this.exchange.createTakeProfitOrder(
            symbol,
            orderType,
            side,
            volume,
            price,
            takeProfitPrice,
            params
          );

          additionalOrders.push({ ...tpOrder, symbol });
        }
      }

      // Log additional orders
      additionalOrders.forEach((order) =>
        this.logger.log(`Additional Order Created - OrderID: ${order.id}, Type: ${order.type}`)
      );

      return [{ ...primaryOrder, symbol }, ...additionalOrders];
    } catch (error) {
      this.logger.error(
        `Failed to Open ${orderType} Order - Side: ${side}, Symbol: ${symbol}, Volume: ${volume}, Price: ${price}. Error: ${error.message}`,
        error.stack
      );
      throw new ExchangeOperationFailedException('opening order', error.message);
    }
  }

  async closePosition(symbol: string, side: OrderSide): Promise<Order> {
    try {
      const order = await this.exchange.closePosition(symbol, side);

      this.logger.log(`Position Closed - AccountID: ${this.account.id}, Order: ${JSON.stringify(order)}`);

      return order;
    } catch (error) {
      this.logger.error(`Failed to Close Position - AccountID: ${this.account.id}, Error: ${error.message}`);
      throw new ExchangeOperationFailedException('close position', error.message);
    }
  }

  async updateStopLoss(orderId: string, symbol: string, amount: number, stopLossPrice: number): Promise<Order> {
    try {
      const updatedOrder = await this.editOrder(
        orderId,
        symbol,
        'stop_loss',
        'sell',
        amount,
        stopLossPrice,
        'updating stop loss'
      );

      this.logger.log(
        `Stop Loss Updated - AccountID: ${this.account.id}, OrderID: ${orderId}, Symbol: ${symbol}, Amount: ${amount}, Stop Loss Price: ${stopLossPrice}`
      );

      return updatedOrder;
    } catch (error) {
      throw error;
    }
  }

  async updateTakeProfit(orderId: string, symbol: string, amount: number, takeProfitPrice: number): Promise<Order> {
    try {
      const updatedOrder = await this.editOrder(
        orderId,
        symbol,
        'take_profit',
        'sell',
        amount,
        takeProfitPrice,
        'updating take profit'
      );

      this.logger.log(
        `Take Profit Updated - AccountID: ${this.account.id}, OrderID: ${orderId}, Symbol: ${symbol}, Amount: ${amount}, Take Profit Price: ${takeProfitPrice}`
      );

      return updatedOrder;
    } catch (error) {
      throw error;
    }
  }

  private async editOrder(
    orderId: string,
    symbol: string,
    type: string,
    side: string,
    amount: number,
    price: number,
    actionDescription: string
  ): Promise<Order> {
    try {
      const order = await this.exchange.editOrder(orderId, symbol, type, side, amount, price);

      this.logger.log(
        `Order Edited - AccountID: ${this.account.id}, Type: ${type}, Side: ${side}, OrderID: ${orderId}, Symbol: ${symbol}, Amount: ${amount}, Price: ${price}`
      );

      return order;
    } catch (error) {
      this.logger.error(
        `Failed to Edit Order - AccountID: ${this.account.id}, Type: ${type}, Side: ${side}, OrderID: ${orderId}, Symbol: ${symbol}, Amount: ${amount}, Price: ${price}, Error: ${error.message}`
      );
      throw new ExchangeOperationFailedException(actionDescription, error.message);
    }
  }

  async closeOrdersWithSymbol(symbol: string): Promise<boolean> {
    try {
      await this.exchange.cancelAllOrders(symbol);
      this.logger.log(`Closed All Orders - AccountID: ${this.account.id}, Symbol: ${symbol}`);

      return true;
    } catch (error) {
      const errMsg = `Close Orders Failed - AccountID: ${this.account.id}, Symbol: ${symbol}, Error: ${error.message}`;

      this.logger.error(errMsg);

      return false;
    }
  }

  async closeOrder(orderId: string, symbol: string): Promise<boolean> {
    try {
      await this.exchange.cancelOrder(orderId, symbol);
      this.logger.log(`Closed Order - AccountID: ${this.account.id}, OrderID: ${orderId}, Symbol: ${symbol}`);

      return true;
    } catch (error) {
      const errMsg = `Close Order Failed - AccountID: ${this.account.id}, OrderID: ${orderId}, Symbol: ${symbol}, Error: ${error.message}`;

      this.logger.error(errMsg);

      return false;
    }
  }

  async clean() {
    try {
      await this.exchange.close();
      this.logger.log(`Termination Successful - AccountID: ${this.account.id}`);
    } catch (error) {
      const errMsg = `Termination Failed - AccountID: ${this.account.id}, Error: ${error.message}`;

      this.logger.error(errMsg);
      throw new ExchangeTerminationFailedException(this.account.id, errMsg);
    }
  }
}

// async openMarketLongOrder(symbol: string, size: number): Promise<Order> {
//   try {
//     const order = await this.exchange.createMarketBuyOrder(symbol, size);

//     this.logger.log(
//       `Opened Market Long Order Successfully - AccountID: ${this.account.id}, Symbol: ${symbol}, Size: ${size}`
//     );

//     return order;
//   } catch (error) {
//     this.logger.error(
//       `Failed to Open Market Long Order - AccountID: ${this.account.id}, Symbol: ${symbol}, Size: ${size}, Error: ${error.message}`
//     );
//     throw new ExchangeOperationFailedException('opening market long order', error.message);
//   }
// }

// async openMarketShortOrder(symbol: string, size: number): Promise<Order> {
//   try {
//     const order = await this.exchange.createMarketSellOrder(symbol, size);

//     this.logger.log(
//       `Opened Market Short Order Successfully - AccountID: ${this.account.id}, Symbol: ${symbol}, Size: ${size}`
//     );

//     return order;
//   } catch (error) {
//     this.logger.error(
//       `Failed to Open Market Short Order - AccountID: ${this.account.id}, Symbol: ${symbol}, Size: ${size}, Error: ${error.message}`
//     );
//     throw new ExchangeOperationFailedException('opening market short order', error.message);
//   }
// }

// async openLimitLongOrder(symbol: string, size: number, price: number): Promise<Order> {
//   try {
//     const order = await this.exchange.createLimitBuyOrder(symbol, size, price);

//     this.logger.log(
//       `Opened Limit Long Order Successfully - AccountID: ${this.account.id}, Symbol: ${symbol}, Size: ${size}, Price: ${price}`
//     );

//     return order;
//   } catch (error) {
//     this.logger.error(
//       `Failed to Open Limit Long Order - AccountID: ${this.account.id}, Symbol: ${symbol}, Size: ${size}, Price: ${price}, Error: ${error.message}`
//     );
//     throw new ExchangeOperationFailedException('opening limit long order', error.message);
//   }
// }

// async openLimitShortOrder(symbol: string, size: number, price: number): Promise<Order> {
//   try {
//     const order = await this.exchange.createLimitSellOrder(symbol, size, price);

//     this.logger.log(
//       `Limit Short Order Opened - AccountID: ${this.account.id}, Symbol: ${symbol}, Size: ${size}, Price: ${price}`
//     );

//     return order;
//   } catch (error) {
//     this.logger.error(
//       `Failed to Open Limit Short Order - AccountID: ${this.account.id}, Symbol: ${symbol}, Size: ${size}, Price: ${price}, Error: ${error.message}`
//     );
//     throw new ExchangeOperationFailedException('opening limit short order', error.message);
//   }
// }
