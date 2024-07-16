export const Timers = {
  MARKETS_CACHE_COOLDOWN: 30 * 60 * 1000, // 30m
  POSITIONS_CACHE_COOLDOWN: 30 * 1000, // 30s
  ORDERS_CACHE_COOLDOWN: 30 * 1000, // 30s
  STRATEGIES_CHECK_COOLDOWN: 3 * 60 * 1000, // 3m
  TICKERS_CACHE_COOLDOWN: 30 * 1000, // 30s
  TRADE_LOOP_COOLDOWN: 5 * 1000 // 5s
} as const;

export type TimerType = (typeof Timers)[keyof typeof Timers];
