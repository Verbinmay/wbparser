import * as _ from 'lodash';
import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { BT_NO, BT_YES } from './constants/button.constants';
import { START_MAIN_SCENE } from './constants/scene.constants';
import { ContextSceneType } from './types/context.interface';

@Update()
export class TelegramUpdate {
  @Start()
  async onStart(@Ctx() ctx: ContextSceneType) {
    try {
      const buttons = _.shuffle([
        [Markup.button.callback(`${BT_NO}`, `BT_NO`)],
        [Markup.button.callback(`${BT_YES}`, `BT_YES`)],
      ]);

      await ctx.reply(
        'Вас приветствует бот WB, я умею отвечать на отзывы, будем дружить?',
        {
          disable_notification: true,
          reply_markup: {
            inline_keyboard: buttons,
          },
        },
      );
    } catch (e) {
      console.log(e, 'error');
    }
  }

  @On('callback_query')
  async getQuery(@Ctx() ctx: ContextSceneType) {
    try {
      const data: string = ctx.callbackQuery.data;

      switch (data) {
        case 'BT_YES':
          await ctx.scene.enter(START_MAIN_SCENE);
          break;
      }
      return;
    } catch (error) {
      console.log(error, 'error');
      return;
    }
  }
}
