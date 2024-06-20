import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/model/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../jwt/jwt.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() user: Partial<User>): Promise<User> {
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
  @UseInterceptors(CacheInterceptor)
  async findAll(@Req() request: any): Promise<Partial<User>[]> {
    const userId = request.user.userId;
    return this.userService.findAll(userId);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchUsers(
    @Query('keyword') keyword: string,
    @Query('minAge') minAge: number,
    @Query('maxAge') maxAge: number,
    @Req() request: any,
  ): Promise<Partial<User>[]> {
    return this.userService.searchUsers(
      keyword,
      request.user.sub,
      minAge,
      maxAge,
    );
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  async findOne(
    @Param('username') username: string,
    @Req() request: any,
  ): Promise<Partial<User>> {
    return this.userService.findOne(username, request.user.id);
  }

  @Post('get-token')
  async getToken(
    @Body() user: Partial<User>,
  ): Promise<{ [k: string]: string }> {
    return this.userService.getToken(user.username, user.password);
  }
}
