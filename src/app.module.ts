import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AccountModule } from './account/account.module';
import { DataModule } from './data/data.module';
import { ExchangeModule } from './exchange/exchange.module';
import { AlertModule } from './alert/alert.module';
import { SetupModule } from './setup/setup.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    EventEmitterModule.forRoot(),
    AccountModule,
    SetupModule,
    ExchangeModule,
    DataModule,
    AlertModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
