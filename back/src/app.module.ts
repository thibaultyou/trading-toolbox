import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CONFIG_TOKEN, Config } from '@config/env.config';

import { AccountModule } from './features/account/account.module';
import { AuthModule } from './features/auth/auth.module';
import { CoreModule } from './features/core/core.module';
import { EnvModule } from './features/env/env.module';
import { ExchangeModule } from './features/exchange/exchange.module';
import { HealthModule } from './features/health/health.module';
import { LoggerModule } from './features/logger/logger.module';
import { MarketModule } from './features/market/market.module';
import { OrderModule } from './features/order/order.module';
import { PositionModule } from './features/position/position.module';
import { StrategyModule } from './features/strategy/strategy.module';
import { TickerModule } from './features/ticker/ticker.module';
import { WalletModule } from './features/wallet/wallet.module';

@Module({
  imports: [
    EnvModule, // Global
    LoggerModule, // Global
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      useFactory: (config: Config) => ({
        type: 'postgres',
        host: config.DATABASE_HOST,
        port: config.DATABASE_PORT,
        username: config.DATABASE_USER,
        password: config.DATABASE_PASSWORD,
        database: config.DATABASE_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.NODE_ENV === 'test' || config.NODE_ENV === 'development'
      }),
      inject: [CONFIG_TOKEN]
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthModule,
    AccountModule,
    MarketModule,
    OrderModule,
    PositionModule,
    StrategyModule,
    TickerModule,
    WalletModule,
    ExchangeModule, // Global
    CoreModule,
    HealthModule
  ]
})
export class AppModule {}
