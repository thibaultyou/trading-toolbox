/**
 * Event types used in the system, categorized by domain.
 * Each category contains relevant events that can be emitted.
 */
export const Events = {
  Account: {
    CREATED: 'ACCOUNT.CREATED',
    UPDATED: 'ACCOUNT.UPDATED',
    DELETED: 'ACCOUNT.DELETED'
  },
  User: {
    CREATED: 'USER.CREATED',
    UPDATED: 'USER.UPDATED',
    DELETED: 'USER.DELETED'
  },
  Exchange: {
    INITIALIZED: 'EXCHANGE.INITIALIZED',
    TERMINATED: 'EXCHANGE.TERMINATED'
  },
  Websocket: {
    SUBSCRIBE: 'WEBSOCKET.SUBSCRIBE',
    UNSUBSCRIBE: 'WEBSOCKET.UNSUBSCRIBE'
  },
  Data: {
    EXECUTION_RECEIVED: 'EXECUTION.DATA.RECEIVED',
    ORDER_UPDATED: 'ORDER.DATA.UPDATED',
    POSITION_UPDATED: 'POSITION.DATA.UPDATED',
    TICKER_UPDATED: 'TICKER.DATA.UPDATED',
    WALLET_UPDATED: 'WALLET.DATA.UPDATED'
  },
  Market: {
    BULK_UPDATED: 'MARKETS.UPDATED'
  },
  Order: {
    UPDATED: 'ORDER.UPDATED',
    BULK_UPDATED: 'ORDERS.UPDATED'
  },
  Position: {
    UPDATED: 'POSITION.UPDATED',
    CLOSED: 'POSITION.CLOSED',
    BULK_UPDATED: 'POSITIONS.UPDATED'
  },
  Strategy: {
    ADDED: 'STRATEGY.ADDED',
    BULK_ADDED: 'STRATEGIES.ADDED'
  },
  Wallet: {
    BULK_UPDATED: 'WALLETS.UPDATED'
  }
};

export type EventsType = typeof Events;
