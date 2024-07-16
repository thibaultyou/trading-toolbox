import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountModule } from '@account/account.module';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { CONFIG_TOKEN, IEnvConfiguration } from '@config';
import { EnvModule } from '@env/env.module';
import { ExchangeModule } from '@exchange/exchange.module';
import { HealthModule } from '@health/health.module';
import { LoggerModule } from '@logger/logger.module';
import { MarketModule } from '@market/market.module';
import { OrderModule } from '@order/order.module';
import { PositionModule } from '@position/position.module';
import { StrategyModule } from '@strategy/strategy.module';
import { TickerModule } from '@ticker/ticker.module';
import { UserModule } from '@user/user.module';
import { WalletModule } from '@wallet/wallet.module';

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
