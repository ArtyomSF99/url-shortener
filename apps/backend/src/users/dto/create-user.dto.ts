import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

/**
 * DTO for user registration.
 */
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}