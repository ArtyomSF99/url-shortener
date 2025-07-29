import { IsUrl, IsOptional, IsString, Length } from 'class-validator';

/**
 * DTO for creating a short URL.
 */
export class CreateUrlDto {
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsString()
  @Length(4, 20)
  customSlug?: string;
}