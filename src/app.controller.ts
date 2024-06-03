import { Controller, Get, Query, Res } from '@nestjs/common';
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
  async getHello(
    @Res() res: Response,
    @Query() query: { path: string },
  ): Promise<any> {
    res.status(200).send('Начало выполнения операции...');
    await this.appService.doMainProgram(query.path);
    return { message: 'Hello World!' };
  }

  //   @Get("/hell")
  //   async deleteHello(): Promise<any> {
  //     await this.staticRepo.deleteSt();
  //     return { message: "Hell,World!" };
  //   }

  //   @Get("/dowell")
  //   async downHello(@Res() res: Response): Promise<any> {
  //     res.send("Начало выполнения операции...");
  //     await this.appService.saveDocs();
  //     return { message: "World save!" };
  //   }
}
