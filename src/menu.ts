import { Injectable } from '@nestjs/common';
import readline from 'readline';
import { AppService } from './app.service';
import { StaticRepository } from './entities/userRepo';
// Создание интерфейса ввода/вывода
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

@Injectable()
export class Menu {
  constructor(
    private readonly appService: AppService,
    private readonly staticRepo: StaticRepository,
  ) {
    this.mainHandleSelection = this.mainHandleSelection.bind(this);
    this.firstHandleSelection = this.firstHandleSelection.bind(this);
    this.secondHandleSelection = this.secondHandleSelection.bind(this);
  }

  showMenu() {
    console.log('Выберите вариант:');
    console.log('1. Ввести путь к файлу');
    console.log('2. Стереть базу');
    console.log('3. Сохранить базу в файл');
    console.log('4. Пока');
  }

  async mainHandleSelection(choice) {
    switch (choice.trim()) {
      case '1':
        this.showTextMenu('Выберите путь или N - назад:');
        rl.question('Ваш выбор: ', this.firstHandleSelection);
        break;
      case '2':
        this.showTextMenu('Вы уверены? Y/N');
        rl.question('Ваш выбор: ', this.secondHandleSelection);
        break;
      case '3':
        await this.appService.saveDocs();
        break;
      case '4':
        console.log('Выход...');
        rl.close();
        return;
      default:
        console.log('Неправильный выбор, попробуйте снова.');
    }
  }

  showTextMenu(text: string) {
    console.log(text);
  }

  async firstHandleSelection(choice: string) {
    if (choice.trim() !== 'N') {
      try {
        await this.appService.doMainprogram(choice.trim());
      } catch (e) {
        console.log('Ошибка ввода пути к файлу');
      }
    }
    this.showMenu();
    rl.question('Ваш выбор: ', this.mainHandleSelection);
    return;
  }

  async secondHandleSelection(choice: string) {
    if (choice.trim() === 'Y') {
      await this.staticRepo.deleteSt();
      console.log('База данных очищена');
    }
    this.showMenu();
    rl.question('Ваш выбор: ', this.mainHandleSelection);
    return;
  }
}
