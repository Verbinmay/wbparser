import { Injectable } from '@nestjs/common';
import axios from 'axios';
import csvToJson from 'convert-csv-to-json';
import excelToJson from 'convert-excel-to-json';
import * as fs from 'fs';
// import * as xlsx from 'xlsx';
import { StaticRepository } from './entities/userRepo';
import { StaticEntity } from './entities/info';
import { log } from 'console';
import { DateTime } from 'luxon';

@Injectable()
export class AppService {
  constructor(private readonly staticRepo: StaticRepository) {}
  getHello(): string {
    return 'Hello World!';
  }

  async doMainprogram(filePath: string) {
    // Получить расширение файла
    const info = filePath.split('.').pop().toLowerCase();

    let cleanInfo: Array<any>;
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
    console.log(cleanInfo[0], 'cleanInfo[0]');

    //make arr of encode urls
    for (let i = 0; i < cleanInfo.length; i++) {
      const part: {
        запрос: string;
        частотность: number;
        url?: string;
        needToUpdate?: boolean;
      } = cleanInfo[i];

      const specialRequest = part['запрос'];
      //filtred more 1000
      if (part['частотность'] < 1000) {
        continue;
      }
      const isExist = await this.staticRepo.findOneSt(specialRequest);
      if (isExist !== null) {
        if (
          isExist.createdAt >
          DateTime.now().minus({ days: 3 }).setZone('Europe/Moscow').toJSDate()
        ) {
          continue;
        } else {
          part.needToUpdate = true;
        }
      }
      const url = `https://search.wb.ru/exactmatch/ru/common/v5/search?ab_testing=false&appType=1&curr=rub&dest=-1257786&query=${specialRequest}&resultset=catalog&sort=popular&spp=30&suppressSpellcheck=false`;
      part.url = encodeURI(url);
    }
    cleanInfo = cleanInfo.filter((info) => 'url' in info);
    await this.reqursiEvent(cleanInfo);

    //convert JSON to Excel and save
    // const workBook = xlsx.utils.book_new();
    // const workSheet = xlsx.utils.json_to_sheet(arrForTable);
    // xlsx.utils.book_append_sheet(workBook, workSheet);
    // xlsx.writeFile(workBook, 'convertedJsontoExcel.xlsx');

    console.log('Программа завершена');
  }
  private async reqursiEvent(cleanInfo: any[]) {
    let partOfCleanInfo: Array<any>;
    try {
      //make requests to wb
      const sliceNum = 100;
      do {
        log('stay: ', cleanInfo.length);

        partOfCleanInfo = cleanInfo.splice(0, sliceNum);
        await this.makeOperation(partOfCleanInfo);
      } while (cleanInfo.length > 0);
    } catch (e) {
      //TODO sistem error
      await this.makeOperationWithError(partOfCleanInfo);
      this.reqursiEvent(cleanInfo);
      console.log(e, 'allSettled error');
    }
  }

  async makeOperationWithError(partOfCleanInfo: Array<any>) {
    for (const part of partOfCleanInfo) {
      try {
        await this.makeOperation([part]);
      } catch {
        log('error with request');
      }
    }
  }
  async makeOperation(partOfCleanInfo: Array<any>) {
    const urls = partOfCleanInfo.map((el) => el.url);
    const filteredResult = await this.makeRequest(urls);

    const finishResult = filteredResult.filter(
      (el) =>
        typeof el === 'object' &&
        el !== null &&
        'metadata' in el &&
        'data' in el,
    );
    //processing data
    for (let ia = 0; ia < partOfCleanInfo.length; ia++) {
      const part = partOfCleanInfo[ia];
      const specialRequest = part['запрос'];
      let newStaticEntity;
      if ('needToUpdate' in part && part?.needToUpdate === true) {
        newStaticEntity = await this.staticRepo.findOneSt(specialRequest);
        if (newStaticEntity === null) {
          console.log('error in need To Update');
          continue;
        }
        newStaticEntity.particular = part['частотность'];
      } else {
        newStaticEntity = new StaticEntity(part['запрос'], part['частотность']);
      }
      const cpmInfo = this.findAndRemove(finishResult, specialRequest);

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
      //save to DB
      const rsaveDb = await this.staticRepo.updateSt(newStaticEntity);
      if (rsaveDb === null) {
        console.log('Ошибка при сохранении в базу данных');
      }
    }
  }

  convertExcelToSpecialJson(filePath: string) {
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

  convertCVSToSpecialJson(filePath: string) {
    const json: Array<{ data: string }> = csvToJson.getJsonFromCsv(filePath);
    return json.map((el) => {
      const text: string = el.data.replace(/"/g, '');
      const lastCommaIndex = text.lastIndexOf(',');

      const query: string = text.substring(0, lastCommaIndex);
      const number1: number = +text.substring(lastCommaIndex + 1);

      return {
        запрос: query,
        частотность: number1,
      };
    });
  }

  deleteFile(filePath: string) {
    try {
      fs.unlink(filePath, (err) => {
        if (err) throw err;
        console.log('path/file.txt was deleted');
      });
      console.log('Файл успешно удален:', filePath);
    } catch (error) {
      console.error('Ошибка при удалении файла:', error);
    }
  }

  async makeRequest(part: Array<string>) {
    let filteredResult: Array<any>;

    const promises = part.map((part) => axios.get(part));

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

  findAndRemove(array: Array<any>, value: string) {
    let data: Array<any> | 'error' = 'error';
    for (let ii = 0; ii < array.length; ii++) {
      if (array[ii].metadata.name === value) {
        try {
          data = array[ii].data.products
            .filter((el) => 'cpm' in el.log && el.log.tp === 'b')
            .map((el) => {
              return {
                position: el.log.promoPosition,
                cpm: el.log.cpm,
              };
            });
        } catch (e) {
          console.log('не получилось');
        }

        array.splice(ii, 1);
        break;
      }
    }
    return data;
  }
}
