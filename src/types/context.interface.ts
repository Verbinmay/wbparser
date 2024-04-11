import { CallbackQuery } from '@telegraf/types';
import { Context, Scenes } from 'telegraf';

export interface SceneState {
  [key: string]: any;
}

export type ContextSceneType = Scenes.SceneContext &
  MyContext &
  Scenes.WizardContext;

interface MySceneContextScene extends Scenes.SceneContextScene<MyContext> {
  state: SceneState;
}

export interface MyContext extends Context {
  scene: MySceneContextScene;
  callbackQuery: CallbackQuery.DataQuery;
}
