import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [{
    provide: 'REDIS_CLIENT',  // alias
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const redisUrl = configService.get<string>('REDIS_DEV_URL');
      const redisClient = createClient({
        url: redisUrl,
      });
      redisClient.on('error', (err) => {
        console.error('REDIS CLIENT ERROR');
      });
      await redisClient.connect();
      return redisClient;
    },
  }],
  exports: ['REDIS_CLIENT'],
})
export class RedisClientModuleModule {
}
