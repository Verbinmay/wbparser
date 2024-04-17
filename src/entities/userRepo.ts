import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaticEntity } from './info';

@Injectable()
export class StaticRepository {
  constructor(
    @InjectRepository(StaticEntity)
    private readonly staticRepo: Repository<StaticEntity>,
  ) {}

  async updateSt(staticInfo: StaticEntity) {
    try {
      return await this.staticRepo.save(staticInfo);
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async findSt(skip: number, take: number) {
    try {
      return await this.staticRepo.find({
        order: { createdAt: 'DESC' },
        skip: skip,
        take: take,
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async findOneSt(name: string) {
    try {
      return await this.staticRepo.findOne({ where: { query: name } });
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async findCountSt() {
    try {
      return await this.staticRepo.count();
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async deleteSt() {
    try {
      return await this.staticRepo.clear();
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  //   async addAmountResponds(userId: string, amount: number) {
  //     const result: UpdateResult = await this.userRepo
  //       .createQueryBuilder()
  //       .update(UserEntity)
  //       .set({ amountResponds: () => `"amountResponds" + ${amount}` }) // Отнимаем указанное количество токенов
  //       .where('idChatTg = :userId', { userId })
  //       .execute();
  //     return result;
  //   }
}
