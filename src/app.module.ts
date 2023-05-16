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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      extra: {
        foreignKeys: true,
      },
    }),
    EventEmitterModule.forRoot(),
    AccountModule,
    AlertModule,
    BalanceModule,
    ExchangeModule,
    OrderModule,
    PositionModule,
    SetupModule,
    TickerModule,
    CoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
