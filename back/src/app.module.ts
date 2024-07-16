import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { CONFIG_TOKEN, IEnvConfiguration } from '@config/env.config';

import { AccountModule } from './features/account/account.module';
import { EnvModule } from './features/env/env.module';
import { ExchangeModule } from './features/exchange/exchange.module';
import { HealthModule } from './features/health/health.module';
import { LoggerModule } from './features/logger/logger.module';
import { MarketModule } from './features/market/market.module';
import { OrderModule } from './features/order/order.module';
import { PositionModule } from './features/position/position.module';
import { StrategyModule } from './features/strategy/strategy.module';
import { TickerModule } from './features/ticker/ticker.module';
import { UserModule } from './features/user/user.module';
import { WalletModule } from './features/wallet/wallet.module';

@Module({
  imports: [
    EnvModule, // Global
    LoggerModule, // Global
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      useFactory: (config: IEnvConfiguration) => ({
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
    UserModule,
    AccountModule,
    MarketModule,
    OrderModule,
    PositionModule,
    StrategyModule,
    TickerModule,
    WalletModule,
    ExchangeModule, // Global
    HealthModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    }
  ]
})
export class AppModule {}
