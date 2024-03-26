import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Events, Timers } from '../../config';
import { TickersUpdatedEvent } from './events/tickers-updated.event';

@Injectable()
export class TickerService implements OnModuleInit {
  private logger = new Logger(TickerService.name);
  private ordersTickers: Map<string, string[]> = new Map();
  private positionsTickers: Map<string, string[]> = new Map();
  private trackedTickers: Map<string, Set<string>> = new Map();

  constructor(private eventEmitter: EventEmitter2) {} // private readonly accountService: AccountService // private readonly setupService: SetupService, // private readonly exchangeService: ExchangeService,

  async onModuleInit() {
    setInterval(() => {
      this.refreshAll();
    }, Timers.TICKERS_CACHE_COOLDOWN);
  }

  // getAccountTickers
  // subscribeTickerByMarketId
  // unsubscribeTickerByMarketId

  private async updateTickersWatchList(
    type: 'positions' | 'orders',
    accountId: string,
    marketIds: string[]
  ): Promise<void> {
    const tickersMap = type === 'positions' ? this.positionsTickers : this.ordersTickers;
    const isTrackingAccount = !tickersMap.has(accountId);

    tickersMap.set(accountId, marketIds);
    this.logger.debug(
      `Ticker - ${type.charAt(0).toUpperCase() + type.slice(1)} Watch List Updated - AccountID: ${accountId}, MarketIDs: ${marketIds.join(', ')}`
    );

    if (isTrackingAccount) {
      this.logger.debug(`Ticker - Immediate Refresh Triggered - AccountID: ${accountId}`);
      this.refreshAll().catch((error) =>
        this.logger.error(
          `Ticker - Immediate Refresh Failed - AccountID: ${accountId}, Error: ${error.message}`,
          error.stack
        )
      );
    }
  }

  updateTickerPositionsWatchList(accountId: string, marketIds: string[]) {
    this.updateTickersWatchList('positions', accountId, marketIds);
  }

  updateTickerOrdersWatchList(accountId: string, marketIds: string[]) {
    this.updateTickersWatchList('orders', accountId, marketIds);
  }

  async refreshAll(): Promise<void> {
    this.logger.debug(`Ticker - Refresh All Initiated`);
    const accountIds = new Set([...this.ordersTickers.keys(), ...this.positionsTickers.keys()]);

    accountIds.forEach((accountId) => {
      const ordersTickers = new Set(this.ordersTickers.get(accountId) || []);
      const positionsTickers = new Set(this.positionsTickers.get(accountId) || []);
      const currentUniqueTickers = new Set([...ordersTickers, ...positionsTickers]);
      const haveTickersChanged = this.haveTickersChanged(
        this.trackedTickers.get(accountId) || new Set(),
        currentUniqueTickers
      );

      if (!haveTickersChanged) {
        this.trackedTickers.set(accountId, currentUniqueTickers);
        const marketIds = Array.from(currentUniqueTickers);

        this.eventEmitter.emit(Events.TICKERS_UPDATED, new TickersUpdatedEvent(accountId, marketIds));
        this.logger.log(`Ticker - Update Success - AccountID: ${accountId}, MarketIDs: ${marketIds.join(', ')}`);
      } else {
        this.logger.debug(`Ticker - Update Skipped - AccountID: ${accountId}, Reason: Unchanged`);
      }
    });
  }

  private haveTickersChanged(setA: Set<string>, setB: Set<string>): boolean {
    if (setA.size !== setB.size) return false;

    for (const a of setA) {
      if (!setB.has(a)) return false;
    }

    return true;
  }
}

// async onModuleInit() {
// try {
//   const setups = await this.setupService.findAll();
//   const uniqueSymbols = new Set(
//     setups.map((setup) => `${setup.account}-${setup.market}`),
//   );

//   uniqueSymbols.forEach((symbolKey) => {
//     const [account, symbol] = symbolKey.split('-');

//     this.subscribeToTickerPrice(account, symbol);
//   });
// } catch (error) {
//   throw new TickerModuleInitException(error);
// }
// }

// subscribeToTickerPrice(accountId: string, symbol: string): void {
// try {
//   this.exchangeService.performWsAction(
//     accountId,
//     'subscribe',
//     `tickers.${symbol}`,
//     'subscribing to ticker price',
//   );

//   if (!this.tickerPrices[accountId]) {
//     this.tickerPrices[accountId] = {};
//   }
// } catch (error) {
//   throw new SubscribeToTickerPriceException(symbol, error);
// }
// }

// unsubscribeFromTickerPrice(accountId: string, symbol: string): void {
// try {
//   this.exchangeService.performWsAction(
//     accountId,
//     'unsubscribe',
//     `tickers.${symbol}`,
//     'unsubscribing from ticker price',
//   );

//   if (this.tickerPrices[accountId]) {
//     delete this.tickerPrices[accountId][symbol];
//   }
// } catch (error) {
//   throw new UnsubscribeFromTickerPriceException(symbol, error);
// }
// }

// updateTickerPrice(accountId: string, symbol: string, data: any): void {
//   try {
//     const price = (Number(data.ask1Price) + Number(data.bid1Price)) / 2;

//     if (!this.tickerPrices[accountId]) {
//       this.tickerPrices[accountId] = {};
//     }

//     this.tickerPrices[accountId][symbol] = price;
//     this.logger.debug(`Updated ticker price for ${symbol} ${price}`);
//   } catch (error) {
//     throw new UpdateTickerPriceException(symbol, error);
//   }
// }

// getTickerPrice(accountId: string, base: string): number | undefined {
//   return this.tickerPrices[accountId] && this.tickerPrices[accountId][base];
// }

// getAllTickerPrices(accountId: string): Record<string, number> {
//   return this.tickerPrices[accountId] || {};
// }

// async getTickerPriceHistory(base: string, fetchNewOnly = false): Promise<Candle[]> {
//   try {
//     let url = `https://api.binance.com/api/v3/klines?symbol=${base}&interval=1h&limit=1000`;

//     if (fetchNewOnly && this.lastFetchedTimes[base]) {
//       url += `&startTime=${this.lastFetchedTimes[base]}`;
//     }

//     const { data } = await axios.get(url);

//     const candles = data.map(([time, open, high, low, close]) => ({
//       time: time / 1000,
//       open: Number(open),
//       high: Number(high),
//       low: Number(low),
//       close: Number(close)
//     }));

//     if (candles.length) {
//       this.lastFetchedTimes[base] = candles[candles.length - 1].time * 1000;
//     }

//     return candles;
//   } catch (error) {
//     throw new FetchTickerPriceHistoryException(base, fetchNewOnly, error);
//   }
// }
