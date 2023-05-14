import { Module } from '@nestjs/common';
import { ExchangeModule } from '../exchange/exchange.module';
import { DataService } from './data.service';

@Module({
  imports: [ExchangeModule],
  providers: [DataService],
})
export class DataModule {}
