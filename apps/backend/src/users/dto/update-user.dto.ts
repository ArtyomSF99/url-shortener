import { CreateUserDto } from './create-user.dto';
import { PartialType } from '@nestjs/mapped-types';

/**
 * DTO for updating user information.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
