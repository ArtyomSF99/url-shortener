import { IsString, IsNotEmpty, IsAlphanumeric, Length } from 'class-validator';

/**
 * DTO for updating a short URL slug.
 */
export class UpdateUrlDto {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(4, 20)
  slug: string;
}