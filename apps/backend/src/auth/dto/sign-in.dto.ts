import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO for user sign-in.
 */
export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
