import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Place } from 'src/places/entities/place.entity';
import { User } from '../users/entities/user.entity';
import { Membership } from '../membership/entities/membership.entity';
import { Review } from '../reviews/entities/review.entity';
import { Like } from '../likes/entities/like.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [User, Membership, Place, Review, Like],
          synchronize: true,
          logging: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {
}
