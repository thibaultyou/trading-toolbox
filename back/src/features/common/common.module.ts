import { Module } from '@nestjs/common';

import { WebsocketManagerService } from './services/websocket-manager.service';

@Module({
  exports: [WebsocketManagerService],
  providers: [WebsocketManagerService]
})
export class CommonModule {}
