import { WsTopicV2 } from 'bitget-api';

import { BitgetUnsupportedTopicException } from '@exchange/exceptions/bitget.exceptions';

export const mapUnifiedTopicToBitget = (topic: string): WsTopicV2 => {
  switch (topic) {
    case 'execution':
    case 'order':
      return 'orders';
    case 'position':
      return 'positions';
    case 'wallet':
      return 'account';
    case 'ticker':
      return 'ticker';
    default:
      throw new BitgetUnsupportedTopicException(topic);
  }
};
