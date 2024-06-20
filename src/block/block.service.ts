import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async blockUser(userId: string, blockUserId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['blockedUsers'],
    });
    const blockUser = await this.userRepository.findOne({
      where: { id: blockUserId },
    });

    if (!user || !blockUser) {
      throw new NotFoundException('User not found');
    }

    if (!user.blockedUsers.some((u) => u.id === blockUserId)) {
      user.blockedUsers.push(blockUser);
      await this.userRepository.save(user);
    } else {
      throw new BadRequestException('User is already blocked');
    }
  }

  async unblockUser(userId: string, blockUserId: string): Promise<void> {
    let user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['blockedUsers'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log({
      blockedByUsers: user.blockedByUsers,
      blockedUser: user.blockedUsers,
    });
    if (
      user.blockedUsers.some((blockedUser) => blockedUser.id === blockUserId)
    ) {
      user.blockedUsers = user.blockedUsers.filter(
        (blockedUser) => blockedUser.id !== blockUserId,
      );
      await this.userRepository.save(user);
    } else {
      throw new BadRequestException('User is not blocked');
    }
  }
}
