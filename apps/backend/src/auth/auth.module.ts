import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bull';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RegistrationProcessor } from './registration.processor';
import { EnvKey } from 'src/common/config/env-keys.enum';

/**
 * Module for authentication logic and configuration.
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(EnvKey.JWT_SECRET),
        signOptions: { expiresIn: '60m' },
      }),
    }),
    BullModule.registerQueue({
      name: 'registration',
    }),
  ],
  providers: [AuthService, JwtStrategy, RegistrationProcessor],
  controllers: [AuthController],
})
export class AuthModule {}
