import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Menu, rl } from './menu';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  await app.listen(configService.get('MAINPORT') || 3333);
  const menu = app.get(Menu);
  menu.showMenu();
  rl.question('Ваш выбор: ', menu.mainHandleSelection);
}

try {
  bootstrap();
} catch (e) {
  console.log(e, 'e');
}
