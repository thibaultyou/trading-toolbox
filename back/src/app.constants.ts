export const Events = {
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_DELETED: 'account.deleted',
  ALERT_RECEIVED: 'alert.received',
  BALANCE_UPDATED: 'balance.updated',
  POSITION_UPDATED: 'position.updated',
  SETUP_CREATED: 'setup.created',
  SETUP_UPDATED: 'setup.updated',
  SETUP_DELETED: 'setup.deleted',
  TICKER_UPDATE: 'ticker.update',
  ORDER_UPDATED: 'order.updated',
};

export const Timers = {
  BALANCE_UPDATE_COOLDOWN: 60000,
  ORDER_UPDATE_COOLDOWN: 5000,
  POSITION_UPDATE_COOLDOWN: 5000,
  TRADE_LOOP_COOLDOWN: 5000,
};
