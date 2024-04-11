import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { sessionMiddleware } from './middleware/session.middleware';
import { MainScene } from './scenes/main-scene';
import { RequestScene } from './scenes/request-scene';
import { UploadScene } from './scenes/upload-scene';
import { TelegramUpdate } from './telegramUpdates';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('TOKEN'),
        launchOptions: {
          webhook: {
            domain: configService.get('DOMAIN'),
            hookPath: '/telegram',
          },
        },
        middlewares: [sessionMiddleware],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TelegramUpdate, MainScene, UploadScene, RequestScene],
})
export class AppModule {}
