import {
  IsUrl,
  IsOptional,
  IsString,
  Length,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * DTO for creating a short URL.
 */
export class CreateUrlDto {
  @IsNotEmpty({ message: 'Original URL should not be empty.' })
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: true,
    },
    {
      message:
        'Please provide a valid and secure URL (must start with http:// or https://).',
    },
  )
  @MaxLength(2048, {
    message: 'The original URL must be at most 2048 characters long.',
  })
  originalUrl: string;

  @IsOptional()
  @IsString({ message: 'The custom slug must be a string.' })
  @Matches(/^[\p{L}0-9_-]+$/u, {
    message:
      'The custom slug can only contain letters (including international characters), numbers, underscores, and hyphens.',
  })
  @Length(4, 20, {
    message: 'The custom slug must be between 4 and 20 characters long.',
  })
  slug?: string;
}
