import { IBaseStrategyOptions } from './options/base-strategy-options.interface';
import { IFibonacciMartingaleStrategyOptions } from './options/fibonacci-martingale-strategy-options.interface';

export type StrategyOptions = IBaseStrategyOptions | IFibonacciMartingaleStrategyOptions;
