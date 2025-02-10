// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { Interval } from '@nestjs/schedule';
// import { Order } from 'ccxt';

// import { Timers } from '../config';
// import { AccountService } from '../features/account/account.service';
// import { ExchangeService } from '../features/exchange/exchange.service';
// import { OrderExecutionData } from '../features/exchange/exchange.types';
// import { OrderService } from '../features/order/order.service';
// import { PositionService } from '../features/position/position.service';
// import { Position } from '../features/position/position.types';
// import { TickerService } from '../features/ticker/ticker.service';
// import { SortedMap } from '../utils/sorted-map.util';

// interface Grid {
//   symbol: string;
//   side: 'long' | 'short';
//   firstBuyAmount: number;
//   buyAmount: number;
//   sellAmount: number;
//   deltaPercentage: number;
//   levels: number;
// }

// const gridConfiguration: Grid = {
//   symbol: 'XRPUSDT',
//   side: 'long',
//   firstBuyAmount: 5,
//   buyAmount: 1,
//   sellAmount: 1,
//   deltaPercentage: 0.1,
//   levels: 4,
// };

// const BUY = 'Buy';
// const ERROR_MARGIN_PERCENTAGE = 0.33;

// @Injectable()
// export class GridService implements OnModuleInit {
//   private readonly logger = new Logger(GridService.name);
//   private readonly grid = new SortedMap();
//   private delta: number;
//   private totalFees = 0;
//   private missingOrderLoopCounter = 0;
//   private rearmExcessRemovalCounter = 0;
//   private removalRearmCounter = 0;
//   private rearmFillGapsCounter = 0;
//   private noOrdersRearmCounter = 5;
//   private noPositionRearmCounter = 3;

//   constructor(
//     private readonly tickerService: TickerService,
//     private readonly exchangeService: ExchangeService,
//     private readonly accountService: AccountService,
//     private readonly positionService: PositionService,
//     private readonly orderService: OrderService,
//   ) {}

//   onModuleInit() {
//     this.logger.log(' | Initializing trade loop...');
//     this.setupTradeLoop();
//   }

//   // --------------- Setup & Core Loop Methods ---------------

//   @Interval(Timers.TRADE_LOOP_COOLDOWN)
//   private async setupTradeLoop() {
//     try {
//       await this.tradeLoop();
//     } catch (error) {
//       this.logger.error(' | Error in trade loop iteration', error.stack);
//     }
//   }

//   private async tradeLoop() {
//     this.logger.debug(' | Starting trade loop iteration...');

//     try {
//       const accounts = await this.accountService.findAll();

//       for (const account of accounts) {
//         await this.processAccount(account.name);
//       }
//     } catch (error) {
//       this.logger.error(`| Error processing accounts`, error.stack);
//     }
//   }

//   private async processAccount(accountName: string) {
//     this.logger.debug(`| Processing account | Account: ${accountName}`);

//     try {
//       const positions = await this.positionService.getPositions(accountName);

//       if (gridConfiguration.side === 'long') {
//         await this.processGrid(accountName, positions);
//       }
//     } catch (error) {
//       this.logger.error(
//         `| Error during processing account: ${accountName}`,
//         error.stack,
//       );
//     }
//   }

//   private sleep(ms: number) {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }

//   // --------------- Position & Grid Handling Methods ---------------

//   private async processGrid(accountName: string, positions: Position[]) {
//     this.logger.debug(
//       `| Processing grid | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//     );

//     try {
//       const position = this.findPositionForSymbol(positions);

//       if (position) {
//         this.noPositionRearmCounter = 3;

//         if (this.isGridEmptyOrPositionInvalid(position)) {
//           await this.exchangeService.closePosition(accountName, position);
//           await this.clearGrid(accountName);
//           await this.initializeGrid(accountName, true);
//           await this.sleep(5000);
//         } else {
//           await this.gridHealthCheck(accountName);
//         }
//       } else {
//         this.logger.log(
//           `| No current position | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//         );
//         this.noPositionRearmCounter--;

//         if (this.noPositionRearmCounter === 0) {
//           this.logger.warn(
//             `| No position detected for the third consecutive time. Resetting grid. | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//           );
//           await this.clearGrid(accountName);
//           await this.initializeGrid(accountName, true);
//           this.noPositionRearmCounter = 3;
//         }
//       }
//     } catch (error) {
//       this.logger.error(
//         `| Error processing grid | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//         error.stack,
//       );
//     }
//   }

//   private findPositionForSymbol(positions: Position[]): Position | undefined {
//     return positions.find((p) => p.info.symbol === gridConfiguration.symbol);
//   }

//   private isGridEmptyOrPositionInvalid(position: Position): boolean {
//     return (
//       !this.grid.size ||
//       position.contracts < gridConfiguration.buyAmount ||
//       position.side === 'short'
//     );
//   }

//   private async clearGrid(accountName: string) {
//     this.logger.log(
//       `| Clearing grid | Account: ${accountName} | Ticker: ${gridConfiguration.symbol} | Fees: ${this.totalFees}$`,
//     );
//     this.totalFees = 0;

//     try {
//       await this.exchangeService.closeOrdersWithSymbol(
//         accountName,
//         gridConfiguration.symbol,
//       );
//       this.grid.clear();
//     } catch (error) {
//       this.logger.error(
//         `| Error clearing grid | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//         error.stack,
//       );
//     }
//   }

//   private async initializeGrid(
//     accountName: string,
//     openFirstPosition?: boolean,
//   ) {
//     this.logger.log(
//       `| Initializing grid | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//     );

//     try {
//       this.tickerService.subscribeToTickerPrice(
//         accountName,
//         gridConfiguration.symbol,
//       );
//       const price = this.tickerService.getTickerPrice(
//         accountName,
//         gridConfiguration.symbol,
//       );

//       if (price) {
//         this.delta = (gridConfiguration.deltaPercentage / 100) * price;
//         this.logger.log(
//           `| Calculated delta | Account: ${accountName} | Ticker: ${gridConfiguration.symbol} | Delta: ${this.delta}$ (based on ${gridConfiguration.deltaPercentage}%)`,
//         );

//         if (openFirstPosition) {
//           await this.exchangeService.openMarketLongOrder(
//             accountName,
//             gridConfiguration.symbol,
//             gridConfiguration.firstBuyAmount,
//           );
//         }

//         for (let index = 1; index < gridConfiguration.levels + 1; index++) {
//           await this.setBuyGridLevel(accountName, price - index * this.delta);
//           await this.setSellGridLevel(accountName, price + index * this.delta);
//         }
//       }
//     } catch (error) {
//       this.logger.error(
//         `| Error initializing grid | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//         error.stack,
//       );
//     }
//   }

//   async updateGrid(
//     accountName: string,
//     {
//       orderId,
//       side,
//       orderPrice,
//       orderType,
//       execFee,
//       symbol,
//     }: OrderExecutionData,
//   ) {
//     this.totalFees += parseFloat(execFee);

//     try {
//       if (symbol !== gridConfiguration.symbol) {
//         this.logger.debug(
//           `| Unsupported symbol | Account: ${accountName} | Symbol: ${symbol} | OrderID: ${orderId}`,
//         );

//         return;
//       }

//       if (orderType !== 'Limit') {
//         this.logger.debug(
//           `| Unsupported order type | Account: ${accountName} | Type: ${orderType} | OrderID: ${orderId}`,
//         );

//         return;
//       }

//       this.logger.debug(
//         `| Updating grid for executed order | Account: ${accountName} | OrderID: ${orderId}`,
//       );
//       const executedOrderPrice = parseFloat(orderPrice);
//       const matchingGridOrderPrice = this.grid.get(orderId);
//       const priceToRemove =
//         side === BUY
//           ? matchingGridOrderPrice + (gridConfiguration.levels + 1) * this.delta
//           : matchingGridOrderPrice -
//             (gridConfiguration.levels + 1) * this.delta;
//       const errorMargin = this.delta * ERROR_MARGIN_PERCENTAGE;
//       const orderIdToRemove = this.grid.getKeyByValueInRange(
//         priceToRemove,
//         errorMargin,
//       );

//       this.grid.delete(orderId);
//       const newBuyLevelPrice =
//         side === BUY
//           ? executedOrderPrice - gridConfiguration.levels * this.delta
//           : executedOrderPrice - this.delta;
//       const newSellLevelPrice =
//         side === BUY
//           ? executedOrderPrice + this.delta
//           : executedOrderPrice + gridConfiguration.levels * this.delta;

//       await this.setBuyGridLevel(accountName, newBuyLevelPrice);
//       await this.setSellGridLevel(accountName, newSellLevelPrice);

//       if (!orderIdToRemove) {
//         this.logger.warn(
//           `| Missing orderId for price | Account: ${accountName} | Price: ${priceToRemove}`,
//         );

//         return;
//       } else {
//         await this.exchangeService.closeOrder(
//           accountName,
//           orderIdToRemove,
//           gridConfiguration.symbol,
//         );

//         // FIXME not sure we need the following line
//         this.grid.delete(orderIdToRemove);
//       }
//     } catch (error) {
//       this.logger.error(
//         `| Error updating grid | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//         error.stack,
//       );
//     }
//   }

//   private async gridHealthCheck(accountName: string) {
//     this.logger.debug(
//       `| Grid health check started | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//     );

//     try {
//       const openOrders = await this.orderService.getOrders(
//         accountName,
//         gridConfiguration.symbol,
//       );
//       const wasGridReset = await this.checkForEmptyOrderSides(
//         accountName,
//         openOrders,
//       );

//       if (!wasGridReset) {
//         await this.manageExcessOrders(accountName, openOrders);
//         await this.removeDuplicatedOrders(accountName, openOrders);
//         await this.fillGapsInOrders(accountName, openOrders);
//         await this.verifyOrderNearTicker(accountName, openOrders);
//       }
//     } catch (error) {
//       this.logger.error(
//         `| Error during grid health check | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//         error.stack,
//       );
//     }

//     this.logger.debug(
//       `| Grid health check completed | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//     );
//   }

//   private async checkForEmptyOrderSides(
//     accountName: string,
//     openOrders: Order[],
//   ): Promise<boolean> {
//     try {
//       const buyOrders = openOrders.filter((order) => order.side === 'buy');
//       const sellOrders = openOrders.filter((order) => order.side === 'sell');

//       if (buyOrders.length === 0 || sellOrders.length === 0) {
//         this.noOrdersRearmCounter--;

//         if (this.noOrdersRearmCounter === 0) {
//           this.logger.warn(
//             `| No buy or sell orders detected for the third consecutive time. Resetting grid | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//           );
//           await this.clearGrid(accountName);
//           await this.initializeGrid(accountName, false);
//           this.noOrdersRearmCounter = 3;

//           return true;
//         } else {
//           this.logger.debug(
//             `| No buy or sell orders detected | Account: ${accountName} | Rearm counter: ${this.noOrdersRearmCounter}`,
//           );
//         }
//       } else {
//         this.noOrdersRearmCounter = 3;
//       }

//       return false;
//     } catch (error) {
//       this.logger.error(
//         `| Error checking for empty order sides | Account: ${accountName} | Ticker: ${gridConfiguration.symbol}`,
//         error.stack,
//       );

//       return false;
//     }
//   }

//   private async manageExcessOrders(accountName: string, openOrders: Order[]) {
//     try {
//       if (this.rearmExcessRemovalCounter > 0) {
//         this.rearmExcessRemovalCounter--;

//         if (this.rearmExcessRemovalCounter === 0) {
//           this.logger.log(
//             `| System rearmed | Account: ${accountName} | Ready to remove excess orders if needed.`,
//           );
//         }
//       }

//       const hasExcessBuyOrders = this.hasExcessOrders('buy', openOrders);
//       const hasExcessSellOrders = this.hasExcessOrders('sell', openOrders);

//       if (
//         this.rearmExcessRemovalCounter === 0 &&
//         (hasExcessBuyOrders || hasExcessSellOrders)
//       ) {
//         await this.removeExcessOrders('buy', openOrders, accountName);
//         await this.removeExcessOrders('sell', openOrders, accountName);
//         this.logger.log(
//           `| Excess orders removed | Account: ${accountName} | Rearm counter set.`,
//         );
//         this.rearmExcessRemovalCounter = 5;
//       } else if (!hasExcessBuyOrders && !hasExcessSellOrders) {
//         this.logger.debug(`| No excess orders | Account: ${accountName}`);
//       } else {
//         this.logger.debug(
//           `| Excess orders detected, but system in rearm period | Account: ${accountName} | Rearm counter: ${this.rearmExcessRemovalCounter}`,
//         );
//       }
//     } catch (error) {
//       this.logger.error(
//         `| Error removing excess orders | Account: ${accountName}`,
//         error.stack,
//       );
//     }
//   }

//   private hasExcessOrders(side: 'buy' | 'sell', openOrders: Order[]): boolean {
//     const ordersForSide = openOrders.filter((order) => order.side === side);

//     return ordersForSide.length > gridConfiguration.levels;
//   }

//   private async removeExcessOrders(
//     side: 'buy' | 'sell',
//     openOrders: Order[],
//     accountName: string,
//   ) {
//     this.logger.debug(
//       `| Starting removal of excess ${side} orders | Account: ${accountName}`,
//     );
//     const ordersForSide = openOrders.filter((order) => order.side === side);

//     if (ordersForSide.length > gridConfiguration.levels) {
//       const excessCount = ordersForSide.length - gridConfiguration.levels;
//       const ordersToRemove = this.getOrdersToRemove(
//         ordersForSide,
//         excessCount,
//         side,
//       );

//       for (const order of ordersToRemove) {
//         this.logger.log(
//           `| Removing excess order | Account: ${accountName} | OrderID: ${order.id}`,
//         );
//         await this.exchangeService.closeOrder(
//           accountName,
//           order.id,
//           gridConfiguration.symbol,
//         );
//         this.grid.delete(order.id);
//       }
//     }
//     // Additional logic here for placing new orders at correct levels if needed.
//   }

//   private getOrdersToRemove(
//     orders: Order[],
//     count: number,
//     side: 'buy' | 'sell',
//   ): Order[] {
//     if (side === 'buy') {
//       return orders.sort((a, b) => a.price - b.price).slice(0, count);
//     } else {
//       return orders.sort((a, b) => b.price - a.price).slice(0, count);
//     }
//   }

//   private findDuplicateOrders(orders: Order[]): Order[] {
//     const duplicates: Order[] = [];

//     for (let i = 0; i < orders.length; i++) {
//       for (let j = i + 1; j < orders.length; j++) {
//         const diff = Math.abs(orders[i].price - orders[j].price);
//         const margin = this.delta * ERROR_MARGIN_PERCENTAGE;

//         if (diff < margin) {
//           duplicates.push(orders[j]);
//         }
//       }
//     }

//     return duplicates;
//   }

//   async removeDuplicatedOrders(accountName: string, openOrders: Order[]) {
//     try {
//       if (this.removalRearmCounter > 0) {
//         this.removalRearmCounter--;

//         if (this.removalRearmCounter === 0) {
//           this.logger.log(
//             `| System rearmed | Account: ${accountName} | Ready to remove duplicates again.`,
//           );
//         }
//       }

//       const duplicatedOrders = this.findDuplicateOrders(openOrders);

//       if (this.removalRearmCounter === 0 && duplicatedOrders.length > 0) {
//         for (const order of duplicatedOrders) {
//           this.logger.log(
//             `| Removing duplicated order | Account: ${accountName} | OrderID: ${order.id}`,
//           );
//           await this.exchangeService.closeOrder(
//             accountName,
//             order.id,
//             gridConfiguration.symbol,
//           );
//           this.grid.delete(order.id);
//         }
//         this.logger.debug(
//           `| Duplicated orders removed | Account: ${accountName} | Starting rearm period.`,
//         );
//         this.removalRearmCounter = 3;
//       } else if (duplicatedOrders.length === 0) {
//         this.logger.debug(`| No duplicated orders | Account: ${accountName}`);
//       } else {
//         this.logger.debug(
//           `| Duplicated orders found but system in rearm period | Account: ${accountName} | Rearm counter: ${this.removalRearmCounter}`,
//         );
//       }
//     } catch (error) {
//       this.logger.error(
//         `| Error removing duplicated orders | Account: ${accountName}`,
//         error.stack,
//       );
//     }
//   }

//   async verifyOrderNearTicker(accountName: string, openOrders: Order[]) {
//     try {
//       const buyOrders = openOrders
//         .filter((order) => order.side === 'buy')
//         .sort((a, b) => b.price - a.price);
//       const sellOrders = openOrders
//         .filter((order) => order.side === 'sell')
//         .sort((a, b) => a.price - b.price);

//       if (buyOrders.length > 0 && sellOrders.length > 0) {
//         const maxBuy = buyOrders[0];
//         const minSell = sellOrders[0];
//         const diff = minSell.price - maxBuy.price;
//         const margin = this.delta * ERROR_MARGIN_PERCENTAGE;
//         const price = this.tickerService.getTickerPrice(
//           accountName,
//           gridConfiguration.symbol,
//         );

//         if (diff > 2 * this.delta + margin) {
//           this.missingOrderLoopCounter++;

//           if (this.missingOrderLoopCounter > 2 && price) {
//             this.logger.log(
//               `| Potentially missing order detected near ticker price | Account: ${accountName}`,
//             );

//             let orderPrice: number;
//             let orderType: string;

//             if (minSell.price - price > price - maxBuy.price) {
//               orderPrice = minSell.price - this.delta;
//               orderType = 'sell';
//             } else {
//               orderPrice = maxBuy.price + this.delta;
//               orderType = 'buy';
//             }

//             if (orderType === 'buy') {
//               await this.setBuyGridLevel(accountName, orderPrice);
//             } else {
//               await this.setSellGridLevel(accountName, orderPrice);
//             }

//             this.missingOrderLoopCounter = 0;
//           }
//         }
//       }
//     } catch (error) {
//       this.logger.error(
//         `| Error verifying orders near ticker | Account: ${accountName}`,
//         error.stack,
//       );
//     }
//   }

//   private async fillGapsInOrders(accountName: string, openOrders: Order[]) {
//     this.logger.debug(`| Checking gaps in orders | Account: ${accountName}`);

//     if (this.rearmFillGapsCounter > 0) {
//       this.rearmFillGapsCounter--;

//       if (this.rearmFillGapsCounter === 0) {
//         this.logger.debug(
//           `| Gap check rearm activated | Account: ${accountName} | Ready to fill gaps if needed.`,
//         );
//       } else {
//         this.logger.debug(
//           `| Exiting gap check due to rearm | Account: ${accountName} | Rearm counter: ${this.rearmFillGapsCounter}`,
//         );

//         return;
//       }
//     }

//     try {
//       const buyOrders = openOrders
//         .filter((order) => order.side === 'buy')
//         .sort((a, b) => a.price - b.price);
//       const sellOrders = openOrders
//         .filter((order) => order.side === 'sell')
//         .sort((a, b) => a.price - b.price);

//       if (buyOrders.length === 0 || sellOrders.length === 0) {
//         this.logger.debug(
//           `| No buy or sell orders present. Exiting gap check. | Account: ${accountName}`,
//         );

//         return;
//       }

//       const highestBuyPrice = buyOrders[buyOrders.length - 1].price;
//       const lowestSellPrice = sellOrders[0].price;

//       this.logger.debug(
//         `| Highest buy price | Account: ${accountName} | Price: ${highestBuyPrice}`,
//       );
//       this.logger.debug(
//         `| Lowest sell price | Account: ${accountName} | Price: ${lowestSellPrice}`,
//       );
//       this.logger.debug(
//         `| Checking orders | Account: ${accountName} | Orders: ${openOrders.map(
//           (o) => o.price,
//         )}`,
//       );

//       for (let index = 1; index < gridConfiguration.levels; index++) {
//         const targetBuyPrice = highestBuyPrice - index * this.delta;
//         const targetSellPrice = lowestSellPrice + index * this.delta;

//         if (!this.isOrderPresentNearPrice(buyOrders, targetBuyPrice)) {
//           this.logger.log(
//             `| Buy order missing | Account: ${accountName} | Price: ${targetBuyPrice}`,
//           );
//           await this.setBuyGridLevel(accountName, targetBuyPrice);
//         }

//         if (!this.isOrderPresentNearPrice(sellOrders, targetSellPrice)) {
//           this.logger.log(
//             `| Sell order missing | Account: ${accountName} | Price: ${targetSellPrice}`,
//           );
//           await this.setSellGridLevel(accountName, targetSellPrice);
//         }
//       }

//       this.rearmFillGapsCounter = 5;
//     } catch (error) {
//       this.logger.error(
//         `| Error filling gaps in orders | Account: ${accountName}`,
//         error.stack,
//       );
//     }
//   }

//   private isOrderPresentNearPrice(
//     orders: Order[],
//     targetPrice: number,
//   ): boolean {
//     const margin = this.delta * 0.9;
//     const isOrderNearPrice = orders.some(
//       (order) => Math.abs(order.price - targetPrice) <= margin,
//     );

//     if (isOrderNearPrice) {
//       this.logger.debug(`| Order found near the target price: ${targetPrice}`);
//     } else {
//       this.logger.debug(
//         `| No order present near the target price: ${targetPrice}`,
//       );
//     }

//     return isOrderNearPrice;
//   }

//   // --------------- Order Management Methods ---------------

//   private async setBuyGridLevel(accountName: string, price: number) {
//     this.logger.debug(
//       `| Setting buy grid level | Account: ${accountName} | Price: ${price}`,
//     );

//     try {
//       const buyOrder = await this.exchangeService.openLimitLongOrder(
//         accountName,
//         gridConfiguration.symbol,
//         gridConfiguration.buyAmount,
//         price,
//       );

//       this.grid.set(buyOrder.id, price);
//     } catch (error) {
//       this.logger.error(
//         `| Error setting buy grid level | Account: ${accountName}`,
//         error.stack,
//       );
//     }
//   }

//   private async setSellGridLevel(accountName: string, price: number) {
//     this.logger.debug(
//       `| Setting sell grid level | Account: ${accountName} | Price: ${price}`,
//     );

//     try {
//       const sellOrder = await this.exchangeService.openLimitShortOrder(
//         accountName,
//         gridConfiguration.symbol,
//         gridConfiguration.sellAmount,
//         price,
//       );

//       this.grid.set(sellOrder.id, price);
//     } catch (error) {
//       this.logger.error(
//         `| Error setting sell grid level | Account: ${accountName}`,
//         error.stack,
//       );
//     }
//   }
// }
