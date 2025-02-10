export const Urls = {
  SWAGGER_DOCS: 'docs',
  ACCOUNTS: 'accounts',
  HEALTH: 'health',
  MARKETS: 'markets',
  ORDERS: 'orders',
  POSITIONS: 'positions',
  STRATEGIES: 'strategies',
  TICKERS: 'tickers',
  USERS: 'users',
  WALLETS: 'wallets'
} as const;

export type UrlType = (typeof Urls)[keyof typeof Urls];
