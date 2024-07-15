import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AccountExceptionsFilter } from '@account/exceptions/account.exceptions.filter';
import { envConfig } from '@config/env.config';
import { Urls } from '@config/urls.config';
import { AppLogger } from '@logger/logger.service';
import { MarketExceptionsFilter } from '@market/exceptions/market.exceptions.filter';
import { OrderExceptionsFilter } from '@order/exceptions/order.exceptions.filter';
import { PositionExceptionsFilter } from '@position/exceptions/position.exceptions.filter';
import { StrategyExceptionsFilter } from '@strategy/exceptions/strategy.exceptions.filter';
import { TickerExceptionsFilter } from '@ticker/exceptions/ticker.exceptions.filter';
import { WalletExceptionsFilter } from '@wallet/exceptions/wallet.exceptions.filter';

import { AppModule } from './app.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new AppLogger(envConfig));

  const options = new DocumentBuilder()
    .setTitle('Trading toolbox')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
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
};
bootstrap();
