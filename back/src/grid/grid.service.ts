import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { AccountService } from '../account/account.service';
import { Timers } from '../app.constants';
import { ExchangeService } from '../exchange/exchange.service';
import { OrderExecutionData } from '../exchange/exchange.types';
import { PositionService } from '../position/position.service';
import { Position } from '../position/position.types';
import { TickerService } from '../ticker/ticker.service';
import { SortedMap } from '../utils/sorted-map';

interface Grid {
  symbol: string;
  side: 'long' | 'short';
  firstBuyAmount: number;
  buyAmount: number;
  sellAmount: number;
  deltaPercentage: number;
  levels: number;
}

const gridConfiguration: Grid = {
  symbol: 'XRPUSDT',
  side: 'long',
  firstBuyAmount: 15,
  buyAmount: 1,
  sellAmount: 1,
  deltaPercentage: 0.2,
  levels: 5,
};

const BUY = 'Buy';
const ERROR_MARGIN_PERCENTAGE = 0.33;

@Injectable()
export class GridService implements OnModuleInit {
  private readonly logger = new Logger(GridService.name);
  private readonly grid = new SortedMap();
  private delta: number;
  private totalFees = 0;

  constructor(
    private readonly tickerService: TickerService,
    private readonly exchangeService: ExchangeService,
    private readonly accountService: AccountService,
    private readonly positionService: PositionService,
  ) { }

  onModuleInit() {
    this.logger.log('Initializing trade loop...');
    this.setupTradeLoop();
  }

  // --------------- Setup & Core Loop Methods ---------------

  private setupTradeLoop() {
    try {
      this.logger.log(
        'Trade loop set up with cooldown of: ' +
        Timers.TRADE_LOOP_COOLDOWN +
        'ms',
      );
      setInterval(async () => {
        try {
          await this.tradeLoop();
        } catch (error) {
          this.logger.error('Error during trade loop iteration', error.stack);
        }
      }, Timers.TRADE_LOOP_COOLDOWN);
    } catch (error) {
      this.logger.error('Error setting up trade loop', error.stack);
    }
  }

  private async tradeLoop() {
    this.logger.debug('Starting trade loop iteration...');
    try {
      const accounts = await this.accountService.findAll();
      for (const account of accounts) {
        await this.processAccount(account.name);
      }
    } catch (error) {
      this.logger.error(`Error processing accounts`, error.stack);
    }
  }

  private async processAccount(accountName: string) {
    this.logger.debug(`Processing account: ${accountName}`);
    try {
      const positions = await this.positionService.getPositions(accountName);
      if (gridConfiguration.side === 'long') {
        await this.processLongGrid(accountName, positions);
      }
      // else (gridConfiguration.side === 'short') {
      //   TODO not implemented
      // }
    } catch (error) {
      this.logger.error(
        `Error during processing account: ${accountName}`,
        error.stack,
      );
    }
  }

  // --------------- Position & Grid Handling Methods ---------------

  private async processLongGrid(accountName: string, positions: Position[]) {
    this.logger.debug(`[${accountName}] Processing long positions...`);
    try {
      const position = this.findPositionForSymbol(positions);
      if (position) {
        if (this.isGridEmptyOrPositionInvalid(position)) {
          await this.exchangeService.closePosition(accountName, position);
          await this.clearGrid(accountName);
          await this.initializeGrid(accountName, true);
        }
        // else {
        //   await this.clearGrid(accountName);
        //   await this.initializeGrid(accountName, false);
        // }
      } else {
        this.logger.log(
          `[${accountName}] No current position for ticker: ${gridConfiguration.symbol}`,
        );
        await this.initializeGrid(accountName, true);
      }
    } catch (error) {
      this.logger.error(
        `Error processing long position for account: ${accountName}`,
        error.stack,
      );
    }
  }

  private findPositionForSymbol(positions: Position[]): Position | undefined {
    return positions.find((p) => p.info.symbol === gridConfiguration.symbol);
  }

  private isGridEmptyOrPositionInvalid(position: Position): boolean {
    return (
      !this.grid.size ||
      position.contracts < gridConfiguration.buyAmount ||
      position.side === 'short'
    );
  }

  private async clearGrid(accountName: string) {
    this.logger.log(
      `[${accountName}] Clearing grid for ticker: ${gridConfiguration.symbol}`,
    );
    this.logger.log(
      `[${accountName}] Total fees for completed grid cycle: ${this.totalFees.toFixed(
        2,
      )}`,
    );
    this.totalFees = 0;
    try {
      await this.exchangeService.closeOrdersWithSymbol(
        accountName,
        gridConfiguration.symbol,
      );
      this.grid.clear();
      this.logger.warn(`[${accountName}] Current ${gridConfiguration.symbol} grid values:`, this.grid.sortedValues());
    } catch (error) {
      this.logger.error(
        `Error clearing grid for account: ${accountName}`,
        error.stack,
      );
    }
  }

  private async initializeGrid(
    accountName: string,
    openFirstPosition?: boolean,
  ) {
    this.logger.log(
      `[${accountName}] Initializing grid for ticker: ${gridConfiguration.symbol}`,
    );
    try {
      this.tickerService.subscribeTicker(accountName, gridConfiguration.symbol);
      const price = this.tickerService.getTicker(
        accountName,
        gridConfiguration.symbol,
      );
      if (price) {
        this.delta = (gridConfiguration.deltaPercentage / 100) * price;
        this.logger.log(
          `[${accountName}] Ticker: ${gridConfiguration.symbol} | Calculated delta for ${gridConfiguration.deltaPercentage}% is ${this.delta}$`,
        );
        if (openFirstPosition) {
          await this.exchangeService.openMarketLongOrder(
            accountName,
            gridConfiguration.symbol,
            gridConfiguration.firstBuyAmount,
          );
        }
        for (let index = 1; index < gridConfiguration.levels + 1; index++) {
          await this.setBuyGridLevel(accountName, price - index * this.delta);
          await this.setSellGridLevel(accountName, price + index * this.delta);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error initializing grid for account: ${accountName}`,
        error.stack,
      );
    }
  }

  async updateGrid(
    accountName: string,
    {
      orderId,
      side,
      orderPrice,
      orderType,
      execFee,
      symbol,
    }: OrderExecutionData,
  ) {
    this.totalFees += parseFloat(execFee);
    try {
      if (symbol !== gridConfiguration.symbol) {
        this.logger.debug(
          `[${accountName}] Incorrect symbol ${symbol} for order with ID: ${orderId}`,
        );
        return;
      }
      if (orderType !== 'Limit') {
        this.logger.debug(
          `[${accountName}] Unsupported order type ${orderType} for order with ID: ${orderId}`,
        );
        return;
      }
      this.logger.debug(
        `[${accountName}] Updating grid for executed order with ID: ${orderId}`,
      );
      const executedOrderPrice = parseFloat(orderPrice);
      const matchingGridOrderPrice = this.grid.get(orderId);
      const priceToRemove =
        side === BUY
          ? matchingGridOrderPrice + (gridConfiguration.levels + 1) * this.delta
          : matchingGridOrderPrice -
          (gridConfiguration.levels + 1) * this.delta;
      const errorMargin = this.delta * ERROR_MARGIN_PERCENTAGE;
      const orderIdToRemove = this.grid.getKeyByValueInRange(
        priceToRemove,
        errorMargin,
      );

      this.grid.delete(orderId);
      const newBuyLevelPrice =
        side === BUY
          ? executedOrderPrice - gridConfiguration.levels * this.delta
          : executedOrderPrice - this.delta;
      const newSellLevelPrice =
        side === BUY
          ? executedOrderPrice + this.delta
          : executedOrderPrice + gridConfiguration.levels * this.delta;
      await this.setBuyGridLevel(accountName, newBuyLevelPrice);
      await this.setSellGridLevel(accountName, newSellLevelPrice);

      if (!orderIdToRemove) {
        this.logger.warn(
          `[${accountName}] Unable to find orderId for price: ${priceToRemove}`,
        );
        return;
      } else {
        await this.exchangeService.closeOrder(
          accountName,
          orderIdToRemove,
          gridConfiguration.symbol,
        );

        // FIXME not sure we need the following line
        this.grid.delete(orderIdToRemove);
      }
      this.logger.warn(`[${accountName}] Current ${gridConfiguration.symbol} grid values:`, this.grid.sortedValues());
    } catch (error) {
      this.logger.error(
        `Error updating grid for account: ${accountName}`,
        error.stack,
      );
    }
  }

  // --------------- Order Management Methods ---------------

  private async setBuyGridLevel(accountName: string, price: number) {
    this.logger.debug(
      `[${accountName}] Setting buy grid level at price: ${price}`,
    );
    try {
      const buyOrder = await this.exchangeService.openLimitLongOrder(
        accountName,
        gridConfiguration.symbol,
        gridConfiguration.buyAmount,
        price,
      );
      this.grid.set(buyOrder.id, price);
    } catch (error) {
      this.logger.error(
        `Error setting buy grid level for account: ${accountName}`,
        error.stack,
      );
    }
  }

  private async setSellGridLevel(accountName: string, price: number) {
    this.logger.debug(
      `[${accountName}] Setting sell grid level at price: ${price}`,
    );
    try {
      const sellOrder = await this.exchangeService.openLimitShortOrder(
        accountName,
        gridConfiguration.symbol,
        gridConfiguration.sellAmount,
        price,
      );
      this.grid.set(sellOrder.id, price);
    } catch (error) {
      this.logger.error(
        `Error setting sell grid level for account: ${accountName}`,
        error.stack,
      );
    }
  }
}
