import { Body, Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { StaticRepository } from './entities/userRepo';

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
    await this.appService.saveDocs();
    return { message: 'World save!' };
  }
}
