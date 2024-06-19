import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/model/user.entity';
import * as bcrypt from 'bcrypt';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() user: Partial<User>): Promise<User> {
    console.log({ user });
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt);
    let payload: Partial<User> = {
      ...user,
      password: hash,
    };
    return this.userService.createUser(payload);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':username')
  async findOne(@Param('username') username: string): Promise<User> {
    return this.userService.findOne(username);
  }

  @Get('search')
  async searchUsers(
    @Query('keyword') keyword: string,
    @Query('userId') userId: string,
  ): Promise<User[]> {
    return this.userService.searchUsers(keyword, userId);
  }

  @Post('get-token')
  async getToken(
    @Body() user: Partial<User>,
  ): Promise<{ [k: string]: string }> {
    return this.userService.getToken(user.username, user.password);
  }
}
