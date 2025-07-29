import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

/**
 * Processor for handling user registration jobs.
 */
@Processor('registration')
export class RegistrationProcessor {
  constructor(private readonly usersService: UsersService) {}

  @Process('process-registration')
  async handleRegistration(job: Job) {
    console.log(`Processing registration for: ${job.data.email}`);

    const { email, password } = job.data;

    const existingUser = await this.usersService.findOneByEmail(email);
    
    if (existingUser) {
      console.warn(`User already exists: ${email}`);
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.usersService.create({
      email: email,
      password_hash: hashedPassword,
    });

    console.log(`Successfully registered user: ${email}`);
  }
}
