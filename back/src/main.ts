import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { Urls } from './config';
import { AccountExceptionsFilter } from './features/account/exceptions/account.exceptions.filter';
import { AppLogger } from './features/logger/logger.service';
import { MarketExceptionsFilter } from './features/market/exceptions/market.exceptions.filter';
import { OrderExceptionsFilter } from './features/order/exceptions/order.exceptions.filter';
import { PositionExceptionsFilter } from './features/position/exceptions/position.exceptions.filter';
import { StrategyExceptionsFilter } from './features/strategy/exceptions/strategy.exceptions.filter';
import { TickerExceptionsFilter } from './features/ticker/exceptions/ticker.exceptions.filter';
import { WalletExceptionsFilter } from './features/wallet/exceptions/wallet.exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new AppLogger());

  const options = new DocumentBuilder().setTitle('Trading toolbox').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(Urls.SWAGGER_DOCS, app, document);

  app.useGlobalFilters(
    new AccountExceptionsFilter(),
    new MarketExceptionsFilter(),
    new PositionExceptionsFilter(),
    new OrderExceptionsFilter(),
    new StrategyExceptionsFilter(),
    new TickerExceptionsFilter(),
    new WalletExceptionsFilter()
  );

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(4000);
}

bootstrap();
