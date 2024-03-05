import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from './config';

import { AccountModule } from './account/account.module';
import { BalanceModule } from './balance/balance.module';
import { ExchangeModule } from './exchange/exchange.module';
import { TickerModule } from './ticker/ticker.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: databaseConfig.DATABASE_HOST,
      port: +databaseConfig.DATABASE_PORT,
      username: databaseConfig.DATABASE_USER,
      password: databaseConfig.DATABASE_PASSWORD,
      database: databaseConfig.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AccountModule,
    ExchangeModule,
    BalanceModule,
    // OrderModule,
    // PositionModule,
    // SetupModule,
    // ActionModule,
    // AlertModule,
    TickerModule,
    // CoreModule,
    // GridModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
