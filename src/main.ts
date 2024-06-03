import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import axios from 'axios';
import readline from 'readline';
import { AppModule } from './app.module';
import { Menu } from './menu';
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let menu;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.listen(configService.get('MAINPORT') || 3333, () => {
    console.log(
      `Server running on port ${configService.get('MAINPORT') || 3333}`,
    );
  });

  menu = app.get(Menu);
}

try {
  bootstrap().then(() => {
    (async () => {
      const response = await axios.get('https://api.ipify.org?format=json');
      const outgoingIp = response.data.ip;
      console.log(`Outgoing IP address is: ${outgoingIp}`);
    })();
    menu.showMenu();
    rl.question('Ваш выбор: ', menu.mainHandleSelection);
  });
} catch (e) {
  console.log(e, 'e');
}
