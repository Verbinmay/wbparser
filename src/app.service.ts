import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { log } from 'console';
import csvToJson from 'convert-csv-to-json';
import excelToJson from 'convert-excel-to-json';
import * as fs from 'fs';
import { createWriteStream } from 'fs';
import { DateTime } from 'luxon';
import * as path from 'path';
import { StaticEntity } from './entities/info';
import { StaticRepository } from './entities/userRepo';
import { PartClean } from './types/partClean';

@Injectable()
export class AppService {
  arrNum: string[] = [
    '4124 b',
    '4124 c',
    '94 b',
    '94 c',
    '190 b',
    '190 c',
    'ошибка',
  ];

  constructor(private readonly staticRepo: StaticRepository) {}

  getHello(): string {
    return 'Hello World!';
  }

  async doMainProgram(filePath: string) {
    console.log('Начало выполнения операции...');
    // Получить расширение файла
    const info: string = filePath.split('.').pop().toLowerCase();

    let cleanInfo: Array<PartClean>;
    // Проверить тип файла
    if (info === 'xlsx' || info === 'xls') {
      cleanInfo = this.convertExcelToSpecialJson(filePath);
    } else if (info === 'csv') {
      cleanInfo = this.convertCVSToSpecialJson(filePath);
    } else {
      console.log('Неизвестный тип файла');
    }

    if (cleanInfo === undefined) {
      throw new Error('Не удалось прочитать файл');
    }

    console.log(cleanInfo[0], 'Пример первой записи');

    //make arr of encode urls
    for (const part of cleanInfo) {
      const specialRequest: string = part['запрос'];

      //filtered more 1000
      if (part['частотность'] < 1000) {
        continue;
      }

      const isExist: StaticEntity | null =
        await this.staticRepo.findOneSt(specialRequest);

      if (isExist !== null) {
        if (
          isExist.updateAt >
            DateTime.now()
              .minus({ days: 3 })
              .setZone('Europe/Moscow')
              .toJSDate() &&
          !this.arrNum.includes(isExist['1'])
        ) {
          //Если обновление было до трех дней назад и первая ставка не из списка исключений
          continue;
        } else {
          part.needToUpdate = true;
        }
      }
      const url = `https://search.wb.ru/exactmatch/ru/common/v5/search?ab_testing=false&appType=1&curr=rub&dest=-1257786&query=${specialRequest}&regions=80&resultset=catalog&sort=popular&spp=30&suppressSpellcheck=false`;
      part.url = encodeURI(url);
    }
    cleanInfo = cleanInfo.filter((info) => 'url' in info);
    await this.requiresEvent(cleanInfo);

    console.log('Программа завершена');
  }

  private async requiresEvent(cleanInfo: Array<PartClean>) {
    let partOfCleanInfo: Array<PartClean>;
    try {
      //make requests to wb
      const sliceNum = 10;
      do {
        console.log('stay: ', cleanInfo.length);

        partOfCleanInfo = cleanInfo.splice(0, sliceNum);
        let swimArray: Array<PartClean> = partOfCleanInfo;
        let i: number = 0;

        swimArray = await this.makeOperation(swimArray);

        while (swimArray.length > 0 && i < 5) {
          swimArray = await this.makeOperationWithError(swimArray);
          i++;
        }
      } while (cleanInfo.length > 0);
    } catch (e) {
      await this.makeOperationWithError(partOfCleanInfo);
      await this.requiresEvent(cleanInfo);
      console.log(e, 'allSettled error');
    }
  }

  async createEntity(
    part: PartClean,
    finishResult: Array<any>,
  ): Promise<StaticEntity | 'error'> {
    const specialRequest: string = part['запрос'];
    let newStaticEntity: StaticEntity | null;
    if ('needToUpdate' in part && part?.needToUpdate === true) {
      newStaticEntity = await this.staticRepo.findOneSt(specialRequest);
      if (newStaticEntity === null) {
        console.log('error in need To Update');
        return 'error';
      }
      newStaticEntity.particular = part['частотность'];
    } else {
      newStaticEntity = new StaticEntity(part['запрос'], part['частотность']);
    }
    const cpmInfo: Array<any> | 'error' = this.findAndRemove(
      finishResult,
      specialRequest,
    );

    //creating rating cpm
    for (let ii = 0; ii < 125; ii++) {
      const key = `${ii + 1}`;
      if (cpmInfo !== 'error') {
        const cpmPosition = cpmInfo.find((el) => el.position === ii);
        newStaticEntity[key] = cpmPosition?.cpm.toString() ?? null;
      } else {
        newStaticEntity[key] = 'ошибка';
      }
    }
    return newStaticEntity;
  }

  async makeOperationWithError(partOfCleanInfo: Array<PartClean>) {
    const urls: Array<string> = partOfCleanInfo.map((el) => el.url);
    const filteredResult = await this.makeRequestByOne(urls);

    const finishResult = this.filterTrashReq(filteredResult);
    //processing data
    return await this.createCheckSaveEntity(partOfCleanInfo, finishResult);
  }

  async makeOperation(
    partOfCleanInfo: Array<PartClean>,
  ): Promise<Array<PartClean>> {
    const urls: Array<string> = partOfCleanInfo.map((el) => el.url);
    const filteredResult = await this.makeRequest(urls);

    const finishResult = this.filterTrashReq(filteredResult);
    //processing data
    return await this.createCheckSaveEntity(partOfCleanInfo, finishResult);
  }

  private async createCheckSaveEntity(
    partOfCleanInfo: PartClean[],
    finishResult: any[],
  ) {
    const errArray: Array<PartClean> = [];
    for (const part of partOfCleanInfo) {
      const newStaticEntity: StaticEntity | 'error' = await this.createEntity(
        part,
        finishResult,
      );
      if (newStaticEntity === 'error') {
        continue;
      }
      if (this.arrNum.includes(newStaticEntity['1'])) {
        errArray.push(part);
        continue;
      }
      //save to DB
      console.log(newStaticEntity['1'], 'я сохраняю');
      const saveDb = await this.staticRepo.updateSt(newStaticEntity);
      if (saveDb === null) {
        console.log('Ошибка при сохранении в базу данных');
      }
    }
    return errArray;
  }

  private filterTrashReq(filteredResult: any[]) {
    return filteredResult.filter(
      (el) =>
        typeof el === 'object' &&
        el !== null &&
        'metadata' in el &&
        'data' in el,
    );
  }

  convertExcelToSpecialJson(filePath: string): Array<PartClean> {
    const excelResult = excelToJson({
      sourceFile: filePath,
      columnToKey: {
        '*': '{{columnHeader}}',
      },
    });

    if (!excelResult || !excelResult.Worksheet) {
      throw new Error('Unable to parse Excel file or Worksheet is empty.');
    }
    return excelResult.Worksheet.map((el) => ({
      запрос: el['запрос'],
      частотность: el['частотность'],
    })).slice(1);
  }

  convertCVSToSpecialJson(filePath: string): Array<PartClean> {
    const json: Array<{ data: string }> = csvToJson
      .fieldDelimiter('\n')
      .getJsonFromCsv(filePath);
    console.log(json);

    return json.map((el) => {
      const text: string = el.data.replace(/"/g, '');
      const lastCommaIndex = text.lastIndexOf(';');

      const query: string = text.substring(0, lastCommaIndex);
      const number1: number = +text.substring(lastCommaIndex + 1);

      return {
        запрос: query,
        частотность: number1,
      };
    });
  }

  // maybe in speed request we create a problem
  async makeRequest(part: Array<string>) {
    let filteredResult: Array<any>;
    const promises = part.map((part) =>
      axios.get(part))

    //more time for requests
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const extendedTimeout = 10000;

    const results = await Promise.allSettled(
      promises.map((promise) =>
        Promise.race([promise, delay(extendedTimeout)]),
      ),
    );
    //filter data in only fulfilled requests
    filteredResult = results.filter(
      (result) =>
        result.status === 'fulfilled' &&
        (result.value as any)?.data !== undefined,
    );
    filteredResult = filteredResult.map((result) => result.value.data);
    return filteredResult;
  }

  async makeRequestByOne(part: Array<string>) {
    let result: any;
    const filteredResult: Array<any> = [];
    for (const req of part) {
      try {
        result = await axios.get(req);
      } catch (e) {
        result = 'error';
        continue;
      }
      if (result !== 'error') {
        filteredResult.push(result.data);
      }
    }
    return filteredResult;
  }

  findAndRemove(array: Array<any>, value: string) {
    let data: Array<any> | 'error' = 'error';
    for (let ii = 0; ii < array.length; ii++) {
      if (
        array[ii].metadata.name === value ||
        array[ii].metadata.original === value ||
        array[ii].metadata.normquery === value
      ) {
        try {
          data = array[ii].data.products
            // .filter((el) => 'cpm' in el.log && el.log.tp === 'b')
            .filter((el) => 'cpm' in el.log)
            .map((el) => {
              const typeAdd = el.log.tp;

              return {
                position: el.log.promoPosition,
                cpm: `${el.log.cpm} ${typeAdd}`,
              };
            });
        } catch (e) {
          console.log('не получилось');
        }

        // array.splice(ii, 1);
        break;
      }
    }
    return data;
  }

  async saveDocs() {
    const airports = await this.staticRepo.findCountSt();
    const partNum = Math.ceil(airports / 4);
    console.log('Всего записей: ', airports);
    console.log('часть равна: ', partNum);
    let indexBook = 1;
    const dirPath = path.join('saved');
    let fullPath = path.join('saved', `airports${indexBook}.csv`);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    let fileStream = createWriteStream(fullPath);
    for (let i = 0; i < airports; i += 100) {
      if (i >= partNum * indexBook) {
        fileStream.end();
        indexBook++;
        fullPath = path.join('saved', `airports${indexBook}.csv`);
        fileStream = createWriteStream(fullPath);
      }
      const result = await this.staticRepo.findSt(i, 100);
      console.log(`${i} из ${airports}`);
      if (result === null || result === undefined || result.length === 0) {
        break;
      }

      for (const item of result) {
        let text = `${item.query};${item.particular}`;
        for (let ii = 1; ii < 125; ii++) {
          const indexText = ii.toString();
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
  }
}
