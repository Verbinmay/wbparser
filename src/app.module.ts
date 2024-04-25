import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaticEntity } from './entities/info';
import { StaticRepository } from './entities/userRepo';
import { Menu } from './menu';

const entities = [StaticEntity];
console.log(process.env);

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
  ],
  controllers: [AppController],
  providers: [AppService, StaticRepository, Menu],
})
export class AppModule {}
