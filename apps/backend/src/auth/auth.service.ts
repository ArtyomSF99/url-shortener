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

/**
 * Service for authentication logic, including sign-in and registration.
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectQueue('registration') private registrationQueue: Queue,
  ) {}

  private async comparePasswordInWorker(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const workerPath = path.join(__dirname, 'password.worker.js');

      const worker = new Worker(workerPath, {
        workerData: { password, hash },
      });

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new ApiException(
        'Invalid credentials',
        ErrorCode.INVALID_CREDENTIALS,
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
