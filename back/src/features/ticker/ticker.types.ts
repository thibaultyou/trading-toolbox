export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TickerData {
  bid1Price?: string;
  ask1Price?: string;
  // bid1Volume?: string;
  // ask1Volume?: string;
}

export enum WatchListType {
  Positions = 'Positions',
  Orders = 'Orders'
}
