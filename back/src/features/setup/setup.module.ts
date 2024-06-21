import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';

@Module({
  controllers: [SetupController],
  exports: [SetupService],
  imports: [OrderModule],
  providers: [SetupService]
})
export class SetupModule {}
