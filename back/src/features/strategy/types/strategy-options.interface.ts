import { CurrencyMode } from './currency-mode.enum';

export interface IStrategyOptions {
  currencyMode: CurrencyMode;
  baseOrderSize: number;
  safetyOrderSize: number;
  safetyOrderStepScale: number;
  safetyOrderVolumeScale: number;
  initialSafetyOrderDistancePct: number;
  takeProfitPercentage: number;
  maxSafetyOrdersCount: number;
}
