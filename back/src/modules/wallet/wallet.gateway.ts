import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

import { websocketConfig } from '@config';

import { IWalletAccount } from './types/wallet-account.interface';

@WebSocketGateway(websocketConfig)
export class WalletGateway {
  private readonly logger = new Logger(WalletGateway.name);

  @WebSocketServer()
  server: Server;

  sendWalletsUpdate(accountId: string, walletAccount: IWalletAccount): void {
    this.logger.debug(`sendWalletsUpdate() - start | accountId=${accountId}`);
    this.server.emit('walletsUpdate', { accountId, walletAccount });
    this.logger.log(`sendWalletsUpdate() - success | accountId=${accountId}`);
  }
}
