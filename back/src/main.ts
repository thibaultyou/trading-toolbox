import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { CorrelationIdMiddleware } from '@common/middlewares/correlation-id.middleware';
import { Urls, envConfig } from '@config';
import { AppLogger } from '@logger/logger.service';

import { AppModule } from './app.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.use(new CorrelationIdMiddleware().use);
  app.useLogger(new AppLogger(envConfig));

  const options = new DocumentBuilder()
    .setTitle('Trading toolbox')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' })
    .addServer('/api')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(Urls.SWAGGER_DOCS, app, document);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(4000);
};
bootstrap();
