import { ICoinData } from './coin-data.interface';

export interface IWalletAccount {
  accountType: string;
  coin: ICoinData[];
}
