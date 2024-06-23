import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { websocketConfig } from '../../config';
import { IWalletAccount } from './types/wallet-account.interface';

@WebSocketGateway(websocketConfig)
export class BalanceGateway {
  @WebSocketServer()
  server: Server;

  sendBalancesUpdate(accountId: string, walletAccount: IWalletAccount) {
    this.server.emit('balancesUpdate', { accountId, walletAccount });
  }
}
