import { MinMax } from 'ccxt';

export interface IExchangeLimits {
  amount?: MinMax;
  cost?: MinMax;
  price?: MinMax;
  leverage?: MinMax;
}
