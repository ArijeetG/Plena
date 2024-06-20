import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/model/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../jwt/jwt.guard';

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
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() request: any): Promise<User[]> {
    const userId = request.user.userId;
    return this.userService.findAll(userId);
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('username') username: string,
    @Req() request: any,
  ): Promise<User> {
    return this.userService.findOne(username, request.user.id);
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
