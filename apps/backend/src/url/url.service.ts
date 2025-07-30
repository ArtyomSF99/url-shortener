import {
  Injectable,
  Inject,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as dns from 'dns';
import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';
import { ApiException } from 'src/common/exceptions/api.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes.enum';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { promisify } from 'util';
import { Url } from './entities/url.entity';
import { QueryParamsDto } from './dto/query-params.dto';

export interface PaginatedUrls {
  data: Url[];
  total: number;
  page: number;
  limit: number;
}

const lookup = promisify(dns.lookup);

/**
 * Service for URL management and redirection logic.
 */
@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createUrlDto: CreateUrlDto, userId: string): Promise<Url> {
    const { originalUrl, slug: customSlug } = createUrlDto;

    // Check if the domain of the original URL is valid and reachable
    try {
      const urlObject = new URL(originalUrl);
      await lookup(urlObject.hostname);
    } catch (error) {
      throw new ApiException(
        'The provided URL is invalid or its domain cannot be reached.',
        ErrorCode.INVALID_URL,
        HttpStatus.BAD_REQUEST,
      );
    }

    let slug = customSlug || nanoid(7);

    // Check if slug already exists
    let existing = await this.urlRepository.findOneBy({ slug });
    let attempts = 0;

    // Try up to 3 times to generate a unique slug if not using a customSlug
    if (!customSlug) {
      for (let i = 0; i < 3 && existing; i++) {
        slug = nanoid(7);
        existing = await this.urlRepository.findOneBy({ slug });
        attempts++;
      }
    }

    if (existing) {
      throw new ApiException(
        'This custom slug is already taken or could not generate a unique slug.',
        ErrorCode.SLUG_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    const newUrl = this.urlRepository.create({
      originalUrl,
      slug,
      userId,
    });

    return this.urlRepository.save(newUrl);
  }

  async findOneBySlug(slug: string): Promise<Url> {
    const url = await this.urlRepository.findOneBy({ slug });

    if (!url) {
      throw new ApiException(
        `URL with slug '${slug}' not found`,
        ErrorCode.URL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return url;
  }

  async findAll(): Promise<Url[]> {
    return this.urlRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(
    id: string,
    userId: string,
    updateUrlDto: UpdateUrlDto,
  ): Promise<Url> {
    const urlToUpdate = await this.urlRepository.findOneBy({ id });

    if (!urlToUpdate) {
      throw new ApiException(
        `URL with ID '${id}' not found`,
        ErrorCode.URL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (urlToUpdate.userId !== userId) {
      throw new ApiException(
        'You do not have permission to edit this URL.',
        ErrorCode.URL_NOT_FOUND,
        HttpStatus.FORBIDDEN,
      );
    }

    const { slug } = updateUrlDto;

    const existingSlug = await this.urlRepository.findOneBy({ slug });

    if (existingSlug && existingSlug.id !== id) {
      throw new ApiException(
        'This custom slug is already taken.',
        ErrorCode.SLUG_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    urlToUpdate.slug = slug;

    return this.urlRepository.save(urlToUpdate);
  }

  async findAllForUser(
    userId: string,
    queryParams: QueryParamsDto,
  ): Promise<PaginatedUrls> {
    const { page, limit, sortBy, sortOrder } = queryParams;
    const skip = (page - 1) * limit;

    const [data, total] = await this.urlRepository.findAndCount({
      where: { userId },
      order: {
        [sortBy]: sortOrder,
      },
      take: limit,
      skip: skip,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async handleRedirect(slug: string): Promise<string> {
    const cacheKey = `url_${slug}`;
    let originalUrl: string;

    originalUrl = (await this.cacheManager.get<string>(cacheKey)) ?? '';

    if (originalUrl) {
      console.log(`Cache hit for slug: ${slug}`);
    } else {
      console.log(`Cache miss for slug: ${slug}`);

      const url = await this.urlRepository.findOneBy({ slug });

      if (!url) {
        throw new ApiException(
          `URL with slug '${slug}' not found`,
          ErrorCode.URL_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      originalUrl = url.originalUrl;

      await this.cacheManager.set(cacheKey, originalUrl);
    }

    await this.urlRepository.increment({ slug }, 'visits', 1);

    return originalUrl;
  }
}
