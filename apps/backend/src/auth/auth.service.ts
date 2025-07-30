import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiException } from 'src/common/exceptions/api.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes.enum';
import { Worker } from 'worker_threads';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { RunMode } from 'src/common/config/run-mode.enum';
import { EnvKey } from 'src/common/config/env-keys.enum';

/**
 * Service for authentication logic, including sign-in and registration.
 */
@Injectable()
export class AuthService {
  private isProduction: boolean;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectQueue('registration') private registrationQueue: Queue,
  ) {
    this.isProduction =
      this.configService.get<string>(EnvKey.NODE_ENV) === RunMode.PRODUCTION;
  }

  private async comparePasswordInWorker(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const workerPath = path.join(__dirname, 'password.worker.js');

      const worker = new Worker(workerPath, {
        workerData: { password, hash },
      });

      worker
        .on('message', resolve)
        .on('error', reject)
        .on('exit', (code) => {
          code !== 0 && reject(Error(`Worker stopped with exit code ${code}`));
        });
    });
  }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new ApiException(
        'User not found',
        ErrorCode.USER_NOT_FOUND,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await this.comparePasswordInWorker(
      pass,
      user.password_hash,
    );

    if (!isMatch) {
      throw new ApiException(
        'Invalid credentials',
        ErrorCode.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    await this.registrationQueue.add('process-registration', {
      email: createUserDto.email,
      password: createUserDto.password,
    });

    return {
      message: 'Registration has been queued and will be processed shortly.',
    };
  }
}
