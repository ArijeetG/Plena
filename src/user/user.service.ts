import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(user: Partial<User>): Promise<User> {
    console.log({ user });
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async searchUsers(keyword: string, userId: string): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.blockedUsers', 'blockedUsers')
      .where(
        'user.name LIKE :keyword OR user.surname LIKE :keyword OR user.username LIKE :keyword',
        { keyword: `%${keyword}%` },
      )
      .andWhere('blockedUsers.id IS NULL OR blockedUsers.id != :userId', {
        userId,
      })
      .getMany();
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
}
