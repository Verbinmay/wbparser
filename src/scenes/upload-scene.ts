import axios from 'axios';
import { promises as fsPromises } from 'fs';
import { Command, Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import * as path from 'path';
import { Markup } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { BT_BACK, BT_RELOAD } from '../constants/button.constants';
import {
  REQUEST_SCENE,
  START_MAIN_SCENE,
  UPLOAD_SCENE,
} from '../constants/scene.constants';
import { ChangeMessage } from '../helpers/change-message';
import { ContextSceneType } from '../types/context.interface';

@Scene(UPLOAD_SCENE)
export class UploadScene {
  private readonly baseButtons = [
    [Markup.button.callback(`${BT_BACK}`, `BT_BACK`)],
    [Markup.button.callback(`${BT_RELOAD}`, `BT_RELOAD`)],
  ];

  @SceneEnter()
  async sceneEnter(@Ctx() ctx: ContextSceneType) {
    const message: Message.TextMessage = ctx.scene.state.message;
    let newMessage: Message.TextMessage = message;
    try {
      const messageText: string = `Загрузите документ`;

      newMessage = await ChangeMessage(
        message,
        messageText,
        [...this.baseButtons],
        ctx,
      );

      ctx.scene.state = {
        ...ctx.scene.state,
        message: newMessage,
      };
      return;
    } catch (error) {
      console.log(error, 'error');
    }
  }

  @Command('start')
  async start(@Ctx() ctx: ContextSceneType) {
    await ctx.scene.enter(START_MAIN_SCENE);
    return;
  }

  @On('document')
  async getDocument(@Ctx() ctx: ContextSceneType) {
    console.log('Document received');
    const message: Message.TextMessage = ctx.scene.state.message;
    let newMessage: Message.TextMessage = message;
    try {
      const messageText = `Документ загружен. Не выходите из этой вкладки меню, запущен процесс обработки...`;
      newMessage = await ChangeMessage(
        message,
        messageText,
        [...this.baseButtons],
        ctx,
      );

      ctx.scene.state = {
        ...ctx.scene.state,
        message: newMessage,
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      //find document
      const document = ctx.message.document;
      const fileId = document.file_id;

      const fileLink = await ctx.telegram.getFileLink(fileId);
      const response = await axios
        .get(fileLink.toString(), {
          responseType: 'arraybuffer',
        })
        .finally(() => {
          console.log('File received');
        });

      const fileBuffer = response.data;

      // download file
      const currentFilePath = __filename;
      const currentDir = path.dirname(currentFilePath);
      const filePath = path.join(currentDir, '..', 'data');
      await fsPromises.writeFile(filePath, fileBuffer);

      //enter request scene
      await ctx.scene.enter(REQUEST_SCENE, {
        ...ctx.scene.state,
        filePath: filePath,
      });

      return;
    } catch (e) {
      console.log(e, 'error');
    }
  }

  @On('callback_query')
  async getQuery(@Ctx() ctx: ContextSceneType) {
    try {
      const data: string = ctx.callbackQuery.data;

      switch (data) {
        case 'BT_RELOAD':
          await ctx.scene.reenter();
          break;
        case 'BT_BACK':
          await ctx.scene.enter(START_MAIN_SCENE, {
            ...ctx.scene.state,
          });
          break;
      }
      return;
    } catch (error) {
      console.log(error, 'error');
    }
  }
}
