/**
 * Timers configuration for various cooldowns and delay times in the system.
 * - EXCHANGES_INIT_DELAY: Delay before initializing exchanges.
 * - MARKETS_CACHE_COOLDOWN: Cache refresh interval for market data.
 * - POSITIONS_CACHE_COOLDOWN: Cache refresh interval for position data.
 * - ORDERS_CACHE_COOLDOWN: Cache refresh interval for order data.
 * - STRATEGIES_CHECK_COOLDOWN: Cooldown between strategy checks.
 * - TICKERS_CACHE_COOLDOWN: Cache refresh interval for ticker data.
 * - TRADE_LOOP_COOLDOWN: Delay between each trade loop iteration.
 * - THROTTLE_WINDOW_MS: Throttle window for rate-limited operations.
 */
export const Timers = {
  EXCHANGES_INIT_DELAY: 0.5 * 1000,
  MARKETS_CACHE_COOLDOWN: 30 * 60 * 1000,
  POSITIONS_CACHE_COOLDOWN: 30 * 1000,
  ORDERS_CACHE_COOLDOWN: 30 * 1000,
  STRATEGIES_CHECK_COOLDOWN: 30 * 1000,
  TICKERS_CACHE_COOLDOWN: 30 * 1000,
  TRADE_LOOP_COOLDOWN: 5 * 1000,
  THROTTLE_WINDOW_MS: 1000
};

export type TimersType = keyof typeof Timers;
