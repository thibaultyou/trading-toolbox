import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { websocketConfig } from '../../config';
import { IWalletAccount } from './types/wallet-account.interface';

@WebSocketGateway(websocketConfig)
export class WalletGateway {
  @WebSocketServer()
  server: Server;

  sendWalletsUpdate(accountId: string, walletAccount: IWalletAccount) {
    this.server.emit('walletsUpdate', { accountId, walletAccount });
  }
}
