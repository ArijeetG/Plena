import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../model/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [BlockService],
  controllers: [BlockController],
})
export class BlockModule {}
