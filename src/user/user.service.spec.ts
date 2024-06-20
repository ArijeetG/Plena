import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../model/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BlockService } from '../block/block.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        BlockService,
      ],
      imports: [
        CacheModule.register(),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: {
              expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
            },
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userToCreate = {
        username: 'testuser',
        password: 'password',
        name: 'Test',
        surname: 'User',
      };

      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(userToCreate as User);

      const createdUser = await service.createUser(userToCreate);

      expect(createdUser).toBeDefined();
      expect(createdUser.username).toEqual(userToCreate.username);
    });
  });

  describe('getUser', () => {
    it('should retrieve a user by userId', async () => {
      const userId = '1';
      const user = new User();
      user.id = userId;
      user.username = 'testuser';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const foundUser = await service.getUser(userId);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toEqual(userId);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = '999';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.getUser(userId)).rejects.toThrowError(
        'user_not_found',
      );
    });
  });

  describe('editUser', () => {
    it('should edit a user', async () => {
      const userId = '1';
      const updatedUserData = { name: 'Updated Name' };

      jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        id: 'sample-id',
        birthdate: new Date(),
        name: 'Updated Name',
        surname: 'test',
        username: 'test',
        blockedByUsers: [],
        blockedUsers: [],
        password: 'test',
        isActive: true,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const editedUser = await service.editUser(userId, updatedUserData);

      expect(editedUser).toBeDefined();
      expect(editedUser.name).toEqual(updatedUserData.name);
    });
  });

  describe('getToken', () => {
    it('should throw UnauthorizedException if username is incorrect', async () => {
      const username = 'nonexistentuser';
      const password = 'password';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.getToken(username, password)).rejects.toThrowError(
        'Invalid username or password',
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const username = 'testuser';
      const password = 'incorrectpassword';
      const user = new User();
      user.username = username;
      user.password = await bcrypt.hash('password', 10);

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.getToken(username, password)).rejects.toThrowError(
        'Invalid username or password',
      );
    });
  });
});
