import { Injectable } from '@nestjs/common';
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

    if (user && blockUser) {
      user.blockedUsers.push(blockUser);
      await this.userRepository.save(user);
    }
  }

  async unblockUser(userId: string, blockUserId: string): Promise<void> {
    let user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['blockedUsers'],
    });

    const blockUser = await this.userRepository.findOne({
      where: { id: blockUserId },
    });

    if (user && blockUser && user.blockedUsers.includes(blockUser)) {
      user.blockedUsers = user.blockedUsers.filter(
        (u) => u.id === blockUser.id,
      );
      await this.userRepository.save(user);
    }
  }
}
