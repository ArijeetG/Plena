import { Controller, Param, Post } from '@nestjs/common';
import { BlockService } from './block.service';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post(':userId/:blockUserId')
  async blockUser(
    @Param('userId') userId: string,
    @Param('blockUserId') blockUserId: string,
  ): Promise<void> {
    await this.blockService.blockUser(userId, blockUserId);
  }

  @Post('unblock/:userId/:blockUserId')
  async unblockUser(
    @Param('userId') userId: string,
    @Param('blockUserId') blockUserId: string,
  ): Promise<void> {
    await this.blockService.unblockUser(userId, blockUserId);
  }
}
