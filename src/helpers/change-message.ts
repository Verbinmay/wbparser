import * as lodash from 'lodash';
import { Message } from 'telegraf/typings/core/types/typegram';

export async function ChangeMessage(
  message: Message.TextMessage,
  messageText: string,
  arrayOfInlineButtons: Array<any>,
  ctx: any,
  parse?: 'HTML' | 'Markdown' | 'MarkdownV2',
) {
  messageText = messageText.trim();
  let inlineKeyboardMessage: Message.TextMessage = message;

  const secondOldButtons = message?.reply_markup.inline_keyboard;
  const buttonsCompare = !lodash.isEqual(
    secondOldButtons,
    arrayOfInlineButtons,
  );
  const firstText = message?.text
    .replaceAll('\n', '')
    .replaceAll('<code>', '')
    .replaceAll('</code>', '');
  const secondText = messageText
    .replaceAll('\n', '')
    .replaceAll('<code>', '')
    .replaceAll('</code>', '');
  const messageCompare = firstText !== secondText;
  if (messageCompare || buttonsCompare) {
    try {
      const option: any = {
        disable_notification: true,
        reply_markup: {
          inline_keyboard: arrayOfInlineButtons,
        },
      };
      if (parse) option.parse_mode = parse;
      const messageSent = await ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        undefined,
        messageText,
        option,
      );
      if (messageSent === true) {
        console.log('messageSent is true');
        throw new Error('messageSent is true');
      }
      inlineKeyboardMessage = messageSent;
    } catch (e) {
      const option: any = {
        disable_notification: true,
        reply_markup: {
          inline_keyboard: arrayOfInlineButtons,
        },
      };
      if (parse) option.parse_mode = parse;
      inlineKeyboardMessage = await ctx.reply(messageText, option);
    }
  }
  return inlineKeyboardMessage;
}
