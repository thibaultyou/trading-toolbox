import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountModule } from '@account/account.module';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
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

import { ConfigModule } from './modules/config/config.module';
import { ConfigService } from './modules/config/config.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.env;
        return {
          type: 'postgres',
          host: env.DATABASE_HOST,
          port: env.DATABASE_PORT,
          username: env.DATABASE_USER,
          password: env.DATABASE_PASSWORD,
          database: env.DATABASE_NAME,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: env.NODE_ENV === 'test' || env.NODE_ENV === 'development'
        };
      }
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
    ExchangeModule,
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
