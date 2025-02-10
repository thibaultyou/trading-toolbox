import { OrderSide } from '@order/types/order-side.enum';

export const getUnifiedOrderSide = (info: any): OrderSide => {
  if (info.side) {
    const side = info.side.toLowerCase();

    if (side === 'buy' || side === 'sell') {
      return side === 'buy' ? OrderSide.BUY : OrderSide.SELL;
    }
  }

  if (info.holdSide) {
    const holdSide = info.holdSide.toLowerCase();

    if (holdSide === 'long') {
      return OrderSide.BUY;
    } else if (holdSide === 'short') {
      return OrderSide.SELL;
    }
  }
  return OrderSide.BUY;
};

export const fromSymbolToMarketId = (symbol: string): string => {
  const parts = symbol.split(':')[0].split('/');
  return parts.join('');
};
