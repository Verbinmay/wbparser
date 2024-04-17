import axios from 'axios';
import csvToJson from 'convert-csv-to-json';
import * as fs from 'fs';
import { Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import * as xlsx from 'xlsx';
import { BT_BACK, BT_RELOAD } from '../constants/button.constants';
import { REQUEST_SCENE, START_MAIN_SCENE } from '../constants/scene.constants';
import { ContextSceneType } from '../types/context.interface';

@Scene(REQUEST_SCENE)
export class RequestScene {
  private readonly baseButtons = [
    [Markup.button.callback(`${BT_BACK}`, `BT_BACK`)],
    [Markup.button.callback(`${BT_RELOAD}`, `BT_RELOAD`)],
  ];

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
    filteredResult = results.filter((result) => result.status === 'fulfilled');
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

        array.splice(ii, 1); // Удаление элемента из массива
        break; // Остановка после первого совпадения (если в массиве есть несколько элементов с одинаковым значением)
      }
    }
    return data;
  }

  @SceneEnter()
  async sceneEnter(@Ctx() ctx: ContextSceneType) {
    const message: Message.TextMessage = ctx.scene.state.message;
    const newMessage: Message.TextMessage = message;
    const filePath: string = ctx.scene.state.filePath;
    try {
      const json = csvToJson.getJsonFromCsv(filePath);
      const cleanInfo = json.map((el) => {
        const text: Array<any> = el.data
          .reverse()
          .split(',', 2)
          .map((el) => el.reverse());
        return {
          запрос: text[1],
          частотность: text[0],
        };
      });
      // //parsing Excel file to JSON
      // const excelResult = excelToJson({
      //   sourceFile: filePath,
      //   columnToKey: {
      //     '*': '{{columnHeader}}',
      //   },
      // });
      //
      // if (!excelResult || !excelResult.Worksheet) {
      //   throw new Error('Unable to parse Excel file or Worksheet is empty.');
      // }

      //delete file after parsing
      this.deleteFile(filePath);

      // //cleaning and organizing useful data from JSON
      // const cleanInfo = excelResult.Worksheet.map((el) => ({
      //   запрос: el['запрос'],
      //   частотность: el['частотность'],
      // })).slice(1);

      //make arr of encode urls
      const urls = [];
      for (let i = 0; i < cleanInfo.length; i++) {
        if (i % 300 === 0) {
          console.log(`Обработано ${i} запросов из ${cleanInfo.length}`);
        }
        const part = cleanInfo[i];

        const specialRequest = part['запрос'];
        const url = `https://search.wb.ru/exactmatch/ru/common/v5/search?ab_testing=false&appType=1&curr=rub&dest=-1257786&query=${specialRequest}&resultset=catalog&sort=popular&spp=30&suppressSpellcheck=false`;
        urls.push(encodeURI(url));
      }

      //make requests to wb
      let finishResult: Array<any> = [];
      try {
        do {
          const part = urls.splice(0, 100);
          const filteredResult = await this.makeRequest(part);
          console.log(`Осталось ${urls.length} запросов`);
          finishResult.push(...filteredResult);
        } while (urls.length > 0);

        finishResult = finishResult.filter(
          (el) => 'metadata' in el && 'data' in el,
        );
      } catch (e) {
        console.log(e, 'allSettled error');
      }

      //create finish JSON
      const arrForTable = [];
      for (let i = 0; i < cleanInfo.length; i++) {
        const part = cleanInfo[i];
        const specialRequest = part['запрос'];

        const partInfoForTable = {
          запрос: part['запрос'],
          частотность: part['частотность'],
        };

        const cpmInfo = this.findAndRemove(finishResult, specialRequest);

        //creating rating cpm
        for (let ii = 0; ii < 125; ii++) {
          const key = `${ii + 1} место`;
          if (cpmInfo !== 'error') {
            const cpmPosition = cpmInfo.find((el) => el.position === ii);
            partInfoForTable[key] = cpmPosition?.cpm ?? null;
          } else {
            partInfoForTable[key] = 'ошибка';
          }
        }

        arrForTable.push(partInfoForTable);
        if (i % 300 === 0) {
          console.log(`Обработано ${i} запросов из ${cleanInfo.length}`);
        }
      }

      // delete because we need to move message under file
      // const resultOfDeleting = await ctx.deleteMessage(message.message_id);
      // console.log(resultOfDeleting, 'resultOfDeleting');
      // console.log(message.message_id, 'message.message_id');

      //convert JSON to Excel and save
      const workBook = xlsx.utils.book_new();
      const workSheet = xlsx.utils.json_to_sheet(arrForTable);
      xlsx.utils.book_append_sheet(workBook, workSheet);
      xlsx.writeFile(workBook, 'convertedJsontoExcel.xlsx');

      //send file to user
      let errorChecker: boolean = true;
      let tryChecker: number = 0;
      do {
        try {
          await ctx.replyWithDocument({
            source: 'convertedJsontoExcel.xlsx',
            filename: 'convertedJsontoExcel.xlsx',
          });
          errorChecker = false;
        } catch (e) {
          tryChecker++;
          errorChecker = true;
        }
      } while (errorChecker === true && tryChecker < 5);

      // //delete file after sending
      // this.deleteFile('convertedJsontoExcel.xlsx');

      //enter main scene
      await ctx.scene.enter(START_MAIN_SCENE, { ...ctx.scene.state });
      return;
    } catch (e) {
      await ctx.scene.enter(START_MAIN_SCENE);
      console.log(e, 'error');
    }
  }
}
