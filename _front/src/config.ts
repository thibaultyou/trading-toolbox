// Back-end urls
export const API_URL = process.env.API_URL || 'http://localhost:1234/api';
export const API_ACCOUNTS_PATH = process.env.API_ACCOUNTS || '/accounts';
export const API_ACTIONS_PATH = process.env.API_ACTIONS || '/actions';
export const API_BALANCES_PATH = process.env.API_TICKERS || '/balances';
export const API_SETUPS_PATH = process.env.API_SETUPS || '/setups';
export const API_TICKERS_PATH = process.env.API_TICKERS || '/tickers';
export const WEB_SOCKET_URL = process.env.WEB_SOCKET_URL || 'ws://localhost:1234/ws';

// Front-end urls
export const APP_SETUPS_CREATE_PATH =
  process.env.APP_SETUPS_CREATE || '/create';
export const APP_SETUPS_READ_PATH = process.env.APP_SETUPS_READ || '/setups';