import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AccountModule } from './account/account.module';
import { CoreModule } from './core/core.module';
import { ExchangeModule } from './exchange/exchange.module';
import { AlertModule } from './alert/alert.module';
import { SetupModule } from './setup/setup.module';
import { BalanceModule } from './balance/balance.module';
import { OrderModule } from './order/order.module';
import { PositionModule } from './position/position.module';
import { TickerModule } from './ticker/ticker.module';
import { ActionModule } from './action/action.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    EventEmitterModule.forRoot(),
    AccountModule,
    ExchangeModule,
    BalanceModule,
    OrderModule,
    PositionModule,
    SetupModule,
    ActionModule,
    AlertModule,
    TickerModule,
    CoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
