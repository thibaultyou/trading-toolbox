import { IBaseStrategyOptions } from './base-strategy-options.interface';

export interface IFibonacciMartingaleStrategyOptions extends IBaseStrategyOptions {
  baseOrderSize: number;
  safetyOrderSize: number;
  safetyOrderStepScale: number;
  safetyOrderVolumeScale: number;
  initialSafetyOrderDistancePct: number;
  takeProfitPercentage: number;
  maxSafetyOrdersCount: number;
}
