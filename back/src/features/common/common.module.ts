import { Module } from '@nestjs/common';

import { WebsocketManagerService } from './services/websocket-manager.service';

@Module({
  providers: [WebsocketManagerService],
  exports: [WebsocketManagerService],
})
export class CommonModule {}
