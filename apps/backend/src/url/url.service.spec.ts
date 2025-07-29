import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { ApiException } from '../common/exceptions/api.exception';
import { ErrorCode } from '../common/exceptions/error-codes.enum';
import { nanoid } from 'nanoid';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(),
}));

type MockRepository<T extends object = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T extends object = any>(): MockRepository<T> => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  increment: jest.fn(),
});

describe('UrlService', () => {
  let urlService: UrlService;
  let urlRepository: MockRepository<Url>;
  let cacheManager;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getRepositoryToken(Url),
          useValue: createMockRepository(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    urlService = module.get<UrlService>(UrlService);
    urlRepository = module.get(getRepositoryToken(Url));
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(urlService).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a short URL', async () => {
      const createUrlDto = { originalUrl: 'https://google.com' };
      const userId = 'user-123';
      const expectedSlug = 'abcdefg';
      (nanoid as jest.Mock).mockReturnValue(expectedSlug);
      const expectedUrl = { id: '1', slug: expectedSlug, originalUrl: 'https://google.com', userId };

      urlRepository.findOneBy!.mockResolvedValue(null);
      urlRepository.create!.mockReturnValue(expectedUrl);
      urlRepository.save!.mockResolvedValue(expectedUrl);

      const result = await urlService.create(createUrlDto, userId);

      expect(result.originalUrl).toEqual(createUrlDto.originalUrl);
      expect(result.userId).toEqual(userId);
      expect(urlRepository.save).toHaveBeenCalledWith(expectedUrl);
    });

    it('should throw a conflict exception if custom slug exists', async () => {
      const createUrlDto = { originalUrl: 'https://google.com', customSlug: 'exists' };
      const userId = 'user-123';
      
      urlRepository.findOneBy!.mockResolvedValue({ id: '2', slug: 'exists' });

      await expect(urlService.create(createUrlDto, userId))
          .rejects.toThrow(new ApiException('This custom slug is already taken or could not generate a unique slug.', ErrorCode.SLUG_ALREADY_EXISTS, 409));
    });
  });

  describe('handleRedirect', () => {
    it('should return originalUrl from DB and increment visits on cache miss', async () => {
        const slug = 'testslug';
        const url = { id: '1', slug, originalUrl: 'https://example.com' };

        cacheManager.get.mockResolvedValue(null);
        urlRepository.findOneBy!.mockResolvedValue(url);

        const result = await urlService.handleRedirect(slug);

        expect(result).toEqual(url.originalUrl);
        expect(cacheManager.set).toHaveBeenCalledWith(`url_${slug}`, url.originalUrl);
        expect(urlRepository.increment).toHaveBeenCalledWith({ slug }, 'visits', 1);
    });

    it('should return originalUrl from cache and still increment visits on cache hit', async () => {
        const slug = 'testslug';
        const url = { id: '1', slug, originalUrl: 'https://example.com' };

        cacheManager.get.mockResolvedValue(url.originalUrl);

        const result = await urlService.handleRedirect(slug);

        expect(result).toEqual(url.originalUrl);
        expect(urlRepository.findOneBy).not.toHaveBeenCalled();
        expect(urlRepository.increment).toHaveBeenCalledWith({ slug }, 'visits', 1);
    });
  });
});