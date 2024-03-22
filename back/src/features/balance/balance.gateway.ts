import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Balances } from 'ccxt';
import { Server } from 'socket.io';

import { websocketConfig } from '../../config';

@WebSocketGateway(websocketConfig)
export class BalanceGateway {
  @WebSocketServer()
  server: Server;

  sendBalancesUpdate(accountId: string, balances: Balances) {
    this.server.emit('balancesUpdate', { accountId, balances });
  }
}
