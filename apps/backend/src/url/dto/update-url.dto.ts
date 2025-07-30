import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

/**
 * DTO for updating a short URL slug.
 */
export class UpdateUrlDto {
  @IsString({ message: 'The slug must be a string.' })
  @IsNotEmpty({ message: 'The slug should not be empty.' })
  @Matches(/^[\p{L}0-9_-]+$/u, {
    message:
      'The slug can only contain letters (including international characters), numbers, underscores, and hyphens.',
  })
  @Length(4, 20, {
    message: 'The slug must be between 4 and 20 characters long.',
  })
  slug: string;
}
