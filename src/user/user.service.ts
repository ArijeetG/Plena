import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { format } from 'date-fns';
import { Exclude } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user);
  }

  async findAll(currentUserId: string): Promise<Partial<User>[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.blockedUsers', 'blockedUsers')
      .leftJoin('user.blockedByUsers', 'blockedByUsers')
      .where('blockedUsers.id IS NULL OR blockedUsers.id != :currentUserId', {
        currentUserId,
      })
      .andWhere(
        'blockedByUsers.id IS NULL OR blockedByUsers.id != :currentUserId',
        { currentUserId },
      )
      .getMany();
    return users.map((user) => this.excludeSensitiveFields(user));
  }

  async findOne(
    username: string,
    currentUserId: string,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['blockedByUsers'],
    });

    if (!user) {
      throw new NotFoundException('user_not_found');
    }

    if (
      user.blockedByUsers.some(
        (blockedUser) => blockedUser.id === currentUserId,
      )
    ) {
      throw new ForbiddenException('blocked_by_user');
    }

    const { password, ...result } = await this.userRepository.findOne({
      where: { username },
    });
    return result;
  }

  async searchUsers(
    keyword: string = '',
    userId: string,
    minAge?: number,
    maxAge?: number,
  ): Promise<Partial<User>[]> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.blockedUsers', 'blockedUsers')
      .leftJoin('user.blockedByUsers', 'blockedByUsers');

    const currentDate = new Date();

    if (keyword) {
      query.andWhere(
        'user.username LIKE :keyword OR user.name LIKE :keyword OR user.surname LIKE :keyword',
        { keyword: `%${keyword}%` },
      );
    }

    if (minAge !== undefined) {
      const minBirthdate = new Date(currentDate.getFullYear() - minAge, 0, 1);
      query.andWhere('user.birthdate <= :minBirthdate', {
        minBirthdate: format(minBirthdate, 'yyyy-MM-dd'),
      });
    }

    if (maxAge !== undefined) {
      const maxBirthdate = new Date(
        currentDate.getFullYear() - maxAge + 1,
        0,
        0,
      );
      query.andWhere('user.birthdate >= :maxBirthdate', {
        maxBirthdate: format(maxBirthdate, 'yyyy-MM-dd'),
      });
    }

    query.andWhere(
      'NOT EXISTS (SELECT 1 FROM "user_blocked_users_user" ub WHERE ub."userId_2" = user.id AND ub."userId_1" = :userId) AND ' +
        'NOT EXISTS (SELECT 1 FROM "user_blocked_users_user" ub WHERE ub."userId_1" = user.id AND ub."userId_2" = :userId)',
      { userId },
    );
    const users = (await query.getMany()).map((user) =>
      this.excludeSensitiveFields(user),
    );
    return users;
  }

  async getToken(
    username: string,
    password: string,
  ): Promise<{ [k: string]: string }> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { sub: user.id, username: user.username };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private excludeSensitiveFields(user: Partial<User>): Partial<User> {
    const { password, ...result } = user;
    return result;
  }
}
