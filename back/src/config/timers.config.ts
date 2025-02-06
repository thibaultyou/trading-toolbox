export const Timers = {
  EXCHANGES_INIT_DELAY: 0.5 * 1000, // 0.5s
  MARKETS_CACHE_COOLDOWN: 30 * 60 * 1000, // 30m
  POSITIONS_CACHE_COOLDOWN: 30 * 1000, // 30s
  ORDERS_CACHE_COOLDOWN: 30 * 1000, // 30s
  STRATEGIES_CHECK_COOLDOWN: 30 * 1000, // 30s
  TICKERS_CACHE_COOLDOWN: 30 * 1000, // 30s
  TRADE_LOOP_COOLDOWN: 5 * 1000, // 5s
  THROTTLE_WINDOW_MS: 1000 // 1s
} as const;

export type TimerType = (typeof Timers)[keyof typeof Timers];
