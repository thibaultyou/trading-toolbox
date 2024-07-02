import { CurrencyMode } from './types/currency-mode.enum';

export const calculateOrderSize = (size: number, price: number, currencyMode: CurrencyMode): number =>
  currencyMode === CurrencyMode.BASE ? size : size / price;
