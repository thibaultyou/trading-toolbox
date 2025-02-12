// FIXME Disabled for now, waiting for an envsubst alternative for nginx template configuration
// import { Logger } from '@nestjs/common';
// import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Server } from 'socket.io';

// import { envConfig } from '@config';

// import { IWalletAccount } from './types/wallet-account.interface';

// @WebSocketGateway({
//   cors: {
//     origin: envConfig.WS_CORS_ORIGIN.split(',')
//   },
//   namespace: envConfig.WS_NAMESPACE
// })
// export class WalletGateway {
//   private readonly logger = new Logger(WalletGateway.name);

//   @WebSocketServer()
//   server: Server;

//   sendWalletsUpdate(accountId: string, walletAccount: IWalletAccount): void {
//     this.logger.debug(`sendWalletsUpdate() - start | accountId=${accountId}`);
//     this.server.emit('walletsUpdate', { accountId, walletAccount });
//     this.logger.log(`sendWalletsUpdate() - success | accountId=${accountId}`);
//   }
// }
