import { Body, Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { StaticRepository } from './entities/userRepo';
import { Response } from 'express';
import { createWriteStream } from 'fs';
import { log } from 'console';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly staticRepo: StaticRepository,
  ) {}

  @Get('/well')
  async getHello(@Res() res: Response, @Body() body: any): Promise<any> {
    const path =
      '/Users/markmay/WebstormProjects/fast-parser/telegram-api/nogit/requests 04.2024.csv';
    res.send('Начало выполнения операции...');
    if (body !== undefined && body.isI === true) {
      this.appService.doMainprogram(path);
    }
    return { message: 'Hello World!' };
  }
  @Get('/hell')
  async deleteHello(): Promise<any> {
    await this.staticRepo.deleteSt();
    return { message: 'Hell,World!' };
  }
  @Get('/dowell')
  async downHello(@Res() res: Response): Promise<any> {
    res.send('Начало выполнения операции...');

    const airports = await this.staticRepo.findCountSt();
    const partNum = Math.ceil(airports / 4);
    let indexBook = 1;
    let fileStream = createWriteStream(`airports${indexBook}.csv`); // Создаем поток для записи в файл
    for (let i = 0; i < airports; i += 100) {
      if (i >= partNum * indexBook) {
        fileStream.end();
        indexBook++;
        fileStream = createWriteStream(`airports${indexBook}.csv`); // Создаем поток для записи в файл
      }
      const result = await this.staticRepo.findSt(i, 100);
      log(`${i} из ${airports}`);
      if (result === null || result === undefined || result.length === 0) {
        break;
      }

      for (const item of result) {
        let text = `${item.query};${item.particular}`;
        for (let i = 1; i < 125; i++) {
          const indexText = i.toString();
          if (item[indexText] === null) {
            text += `;`;
          } else {
            text += `;${item[indexText]}`;
          }
        }
        text += `\n`;

        fileStream.write(text); //  CSV
      }
    }
    fileStream.end();
    log('Запись завершена');
    return { message: 'World save!' };
  }
}
