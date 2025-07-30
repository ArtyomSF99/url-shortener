import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getQueueToken } from '@nestjs/bull';
import { ApiException } from '../common/exceptions/api.exception';
import { ErrorCode } from '../common/exceptions/error-codes.enum';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let registrationQueue;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockRegistrationQueue = {
    add: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: getQueueToken('registration'),
          useValue: mockRegistrationQueue,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    registrationQueue = module.get(getQueueToken('registration'));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return an access token for valid credentials', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
      };
      mockUsersService.findOneByEmail.mockResolvedValue(user);

      jest
        .spyOn(authService as any, 'comparePasswordInWorker')
        .mockResolvedValue(true);

      mockJwtService.sign.mockReturnValue('test_token');

      const result = await authService.signIn('test@example.com', 'password');

      expect(result).toEqual({ access_token: 'test_token' });
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should throw an ApiException for invalid credentials', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        authService.signIn('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(
        new ApiException('User not found', ErrorCode.USER_NOT_FOUND, 404),
      );
    });
  });

  describe('register', () => {
    it('should add a registration job to the queue', async () => {
      const createUserDto = {
        email: 'new@example.com',
        password: 'password123',
      };

      await authService.register(createUserDto);

      expect(mockRegistrationQueue.add).toHaveBeenCalledWith(
        'process-registration',
        {
          email: 'new@example.com',
          password: 'password123',
        },
      );
    });
  });
});
