import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { env } from '../config';

import { AccountModule } from './account/account.module';
import { ExchangeModule } from './exchange/exchange.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DATABASE_HOST,
      port: +env.DATABASE_PORT,
      username: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AccountModule,
    ExchangeModule,
    // BalanceModule,
    // OrderModule,
    // PositionModule,
    // SetupModule,
    // ActionModule,
    // AlertModule,
    // TickerModule,
    // CoreModule,
    // GridModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
