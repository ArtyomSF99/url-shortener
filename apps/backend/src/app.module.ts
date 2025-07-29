import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from 'nestjs-throttler';
import { LoggerModule } from 'nestjs-pino';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './data-source';
import { UrlModule } from './url/url.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EnvKey } from './common/config/env-keys.enum';


/**
 * Root application module.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    ThrottlerModule.forRoot({
      ttl: 60000,
      limit: 20,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get<string>(EnvKey.REDIS_URL),
          ttl: 3600,
        }),
      }),
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction =
          configService.get<string>(EnvKey.NODE_ENV) === 'production';
        return {
          pinoHttp: {
            transport: !isProduction
              ? { target: 'pino-pretty', options: { singleLine: true } }
              : undefined,
            redact: isProduction
              ? ['req.headers.authorization', 'req.body.password']
              : [],
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: 'redis',
          port: 6379,
        },
      }),
    }),
    UrlModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
