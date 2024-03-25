import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from './config';
import { AccountModule } from './features/account/account.module';
import { BalanceModule } from './features/balance/balance.module';
import { CoreModule } from './features/core/core.module';
import { ExchangeModule } from './features/exchange/exchange.module';
import { HealthModule } from './features/health/health.module';
import { MarketModule } from './features/market/market.module';
import { OrderModule } from './features/order/order.module';
import { PositionModule } from './features/position/position.module';

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
      synchronize: true
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AccountModule,
    BalanceModule,
    ExchangeModule, // Global
    MarketModule,
    OrderModule,
    PositionModule,
    // SetupModule,
    // ActionModule,
    // AlertModule,
    // TickerModule,
    CoreModule,
    // GridModule,
    HealthModule
  ]
})
export class AppModule {}
