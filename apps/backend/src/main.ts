import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { EnvKey } from './common/config/env-keys.enum';

/**
 * Main entry point for the NestJS application.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const httpAdapterHost = app.get(HttpAdapterHost);

  const port = configService.get<number>(EnvKey.BACKEND_PORT) || 3000;
  const corsOrigin = configService.get<string>(EnvKey.CORS_ORIGIN);

  app.useLogger(app.get(Logger));

  app.enableCors({
    origin: corsOrigin || 'http://localhost:3002',
    methods: 'GET,HEAD,PUT,POST,PATCH',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  await app.listen(port);
}
bootstrap();
