import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { BlockService } from './block.service';
import { JwtAuthGuard } from '../jwt/jwt.guard';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get(':blockUserId')
  @UseGuards(JwtAuthGuard)
  async blockUser(
    @Param('blockUserId') blockUserId: string,
    @Req() request: any,
  ): Promise<void> {
    const userId = request.user.userId;
    await this.blockService.blockUser(userId, blockUserId);
  }

  @Get('unblock/:blockUserId')
  @UseGuards(JwtAuthGuard)
  async unblockUser(
    @Param('blockUserId') blockUserId: string,
    @Req() request: any,
  ): Promise<void> {
    const userId = request.user.userId;
    await this.blockService.unblockUser(userId, blockUserId);
  }
}
