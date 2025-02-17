/**
 * URLs used throughout the application for routing purposes.
 * - SWAGGER_DOCS: URL path for the Swagger documentation.
 * - ACCOUNTS: URL path for account-related endpoints.
 * - AUTH: URL path for authentication-related endpoints.
 * - HEALTH: URL path for health check endpoint.
 * - MARKETS: URL path for market-related endpoints.
 * - ORDERS: URL path for order-related endpoints.
 * - POSITIONS: URL path for position-related endpoints.
 * - STRATEGIES: URL path for strategies-related endpoints.
 * - TICKERS: URL path for ticker-related endpoints.
 * - USERS: URL path for user-related endpoints.
 * - WALLETS: URL path for wallet-related endpoints.
 */
export const Urls = {
  SWAGGER_DOCS: 'docs',
  ACCOUNTS: 'accounts',
  AUTH: 'auth',
  HEALTH: 'health',
  MARKETS: 'markets',
  ORDERS: 'orders',
  POSITIONS: 'positions',
  STRATEGIES: 'strategies',
  TICKERS: 'tickers',
  USERS: 'users',
  WALLETS: 'wallets'
};

export type UrlsType = keyof typeof Urls;
