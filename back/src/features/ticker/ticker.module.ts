import { Module } from '@nestjs/common';

// import { SetupModule } from '../../_setup/setup.module';
// import { SetupCreatedHandler } from './handlers/setup-created.event-handler';
// import { TickerUpdateHandler } from './handlers/update-ticker.event-handler';
import { TickerController } from './ticker.controller';
import { TickerService } from './ticker.service';

@Module({
  // imports: [EventEmitterModule, SetupModule],
  // providers: [TickerUpdateHandler, SetupCreatedHandler, TickerService],
  providers: [TickerService],
  controllers: [TickerController],
  exports: [TickerService],
})
export class TickerModule {}
