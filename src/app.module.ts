import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { sessionMiddleware } from './middleware/session.middleware';
import { MainScene } from './scenes/main-scene';
import { RequestScene } from './scenes/request-scene';
import { UploadScene } from './scenes/upload-scene';
import { TelegramUpdate } from './telegramUpdates';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaticEntity } from './entities/info';
import { StaticRepository } from './entities/userRepo';

const entities = [StaticEntity];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        ssl: configService.get('CON_DB') !== 'dev',
        entities: [...entities],
        timezone: 'Europe/Moscow',
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([...entities]),
    // TelegrafModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     token: configService.get<string>('TOKEN'),
    //     launchOptions: {
    //       webhook: {
    //         domain: configService.get('DOMAIN'),
    //         hookPath: '/telegram',
    //       },
    //     },
    //     middlewares: [sessionMiddleware],
    //   }),
    // }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TelegramUpdate,
    MainScene,
    UploadScene,
    RequestScene,
    StaticRepository,
  ],
})
export class AppModule {}
