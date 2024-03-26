export const Events = {
  // Account module
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_DELETED: 'account.deleted',

  // Balance module
  BALANCES_UPDATED: 'balances.updated',

  // Exchange module
  EXCHANGE_INITIALIZED: 'exchange.initialized',
  EXCHANGE_TERMINATED: 'exchange.terminated',

  // Market module
  MARKETS_UPDATED: 'markets.updated',

  // Order module
  ORDERS_UPDATED: 'orders.updated',
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_TRIGGERED: 'order.triggered',
  ORDER_CANCELLED: 'order.cancelled',

  // Position module
  POSITIONS_UPDATED: 'positions.updated',
  POSITION_CREATED: 'position.created',
  POSITION_UPDATED: 'position.updated',
  POSITION_CLOSED: 'position.closed',

  // Ticker module
  TICKERS_UPDATED: 'tickers.updated',
  TICKER_SUBSCRIBED: 'ticker.subscribed',
  TICKER_UNSUBSCRIBED: 'ticker.unsubscribed',
  TICKER_UPDATED: 'ticker.updated'
};
