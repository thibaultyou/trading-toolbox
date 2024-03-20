import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { websocketConfig } from '../../config';

@WebSocketGateway(websocketConfig)
export class BalanceGateway {
  @WebSocketServer()
  server: Server;

  sendBalanceUpdate(accountName: string, balance: number) {
    this.server.emit('balanceUpdate', { accountName, balance });
  }
}
