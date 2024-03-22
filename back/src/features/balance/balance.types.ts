import { Balance } from 'ccxt';

export type USDTBalance = {
  equity: number | null;
  balance: Balance;
};
