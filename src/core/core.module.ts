import { Module } from '@nestjs/common';
import { ExchangeModule } from '../exchange/exchange.module';
import { CoreService } from './core.service';

@Module({
  imports: [ExchangeModule],
  providers: [CoreService]
})
export class CoreModule { }
