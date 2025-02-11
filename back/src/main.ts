import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { CorrelationIdMiddleware } from '@common/middlewares/correlation-id.middleware';
import { ConfigService } from '@config';
import { AppLogger } from '@logger/logger.service';

import { AppModule } from './app.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = 4000;
  const appLogger = app.get(AppLogger);
  app.enableShutdownHooks();
  app.use(new CorrelationIdMiddleware().use);
  app.useLogger(appLogger);

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Trading toolbox')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header'
    })
    .addServer('/api')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  const swaggerDocsPath = configService.urls.SWAGGER_DOCS;
  SwaggerModule.setup(swaggerDocsPath, app, document);

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(port);
};
bootstrap();
