import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { Urls } from './config';
import { AccountExceptionsFilter } from './features/account/exceptions/account.exceptions.filter';
import { BalanceExceptionsFilter } from './features/balance/exceptions/balance.exceptions.filter';
import { MarketExceptionsFilter } from './features/market/exceptions/market-exceptions.filter';
import { PositionExceptionsFilter } from './features/position/exceptions/position-exceptions.filter';
import { TickerExceptionsFilter } from './features/ticker/exceptions/ticker-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const options = new DocumentBuilder()
    .setTitle('Trading toolbox')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup(Urls.SWAGGER_DOCS, app, document);

  app.useGlobalFilters(
    new AccountExceptionsFilter(),
    new BalanceExceptionsFilter(),
    new MarketExceptionsFilter(),
    new PositionExceptionsFilter(),
    new TickerExceptionsFilter(),
  );

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(4000);
}

bootstrap();
