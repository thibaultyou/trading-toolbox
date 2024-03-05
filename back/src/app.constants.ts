export const Events = {
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_DELETED: 'account.deleted',
  ALERT_RECEIVED: 'alert.received',
  POSITION_UPDATED: 'position.updated',
  SETUP_CREATED: 'setup.created',
  SETUP_UPDATED: 'setup.updated',
  SETUP_DELETED: 'setup.deleted',
  UPDATE_BALANCE: 'update.balance',
  UPDATE_TICKER: 'update.ticker',
  ORDER_UPDATED: 'order.updated',
  ORDER_EXECUTED: 'order.executed',
};

export const Timers = {
  BALANCE_UPDATE_COOLDOWN: 60000,
  HEALTH_CHECK_COOLDOWN: 3000,
  GRID_LOOP_COOLDOWN: 3000,
  ORDER_UPDATE_COOLDOWN: 5000,
  POSITION_UPDATE_COOLDOWN: 2500,
  TRADE_LOOP_COOLDOWN: 5000,
};
