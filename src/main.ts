import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
// import { getBotToken } from 'nestjs-telegraf';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // const bot = app.get(getBotToken());
  // app.use(bot.webhookCallback('/telegram'));
  // await bot.telegram.sendMessage(
  //   424027533,
  //   `hello from ${configService.get('DOMAIN')}`,
  // );
  await app.listen(configService.get('MAINPORT') || 3000);
}

try {
  bootstrap();
} catch (e) {
  console.log(e, 'e');
}
