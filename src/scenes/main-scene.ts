import { Command, Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { BT_BACK, BT_RELOAD, BT_UPLOAD } from '../constants/button.constants';
import { START_MAIN_SCENE, UPLOAD_SCENE } from '../constants/scene.constants';
import { ChangeMessage } from '../helpers/change-message';
import { ContextSceneType } from '../types/context.interface';

@Scene(START_MAIN_SCENE)
export class MainScene {
  private readonly baseButtons = [
    [Markup.button.callback(`${BT_RELOAD}`, `BT_RELOAD`)],
    [Markup.button.callback(`${BT_UPLOAD}`, `BT_UPLOAD`)],
    [Markup.button.callback(`${BT_BACK}`, `BT_BACK`)],
  ];

  @SceneEnter()
  async sceneEnter(@Ctx() ctx: ContextSceneType) {
    const message: Message.TextMessage = ctx.scene.state.message;
    let newMessage: Message.TextMessage = message;
    try {
      const arrayOfInlineButtons = [...this.baseButtons];

      const messageText: string = `Привет`;

      newMessage = await ChangeMessage(
        message,
        messageText,
        arrayOfInlineButtons,
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

  @On('callback_query')
  async getQuery(@Ctx() ctx: ContextSceneType) {
    try {
      const data: string = ctx.callbackQuery.data;

      switch (data) {
        case 'BT_RELOAD':
          await ctx.scene.reenter();
          break;
        case 'BT_UPLOAD':
          await ctx.scene.enter(UPLOAD_SCENE, {
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
