import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { BlockModule } from './block/block.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './model/user.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('db_host'),
        port: configService.get<number>('db_port'),
        username: configService.get<string>('db_username'),
        password: configService.get<string>('db_password'),
        database: configService.get<string>('db_name'),
        entities: [User],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    BlockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
