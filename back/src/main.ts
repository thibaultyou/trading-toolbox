import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AccountExceptionsFilter } from './account/exceptions/account-exceptions.filter';
import { AppModule } from './app.module';
import { TickerExceptionsFilter } from './ticker/exceptions/ticker-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const options = new DocumentBuilder()
    .setTitle('Trading app')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalFilters(
    new AccountExceptionsFilter(),
    new TickerExceptionsFilter(),
  );

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(4000);
}
bootstrap();
