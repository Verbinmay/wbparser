import { DateTime } from 'luxon';
import {
  BeforeUpdate,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class StaticEntity {
  constructor(query: string, particular: number) {
    this.query = query;
    this.particular = particular;
  }
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column()
  public createdAt: Date = DateTime.now().setZone('Europe/Moscow').toJSDate();
  @Index({ unique: true })
  @Column()
  public query: string;
  @Column()
  public particular: number;
  @Column()
  public updateAt: Date = DateTime.now().setZone('Europe/Moscow').toJSDate();
  @Column({ nullable: true })
  public '1': null | string;
  @Column({ nullable: true })
  public '2': null | string;
  @Column({ nullable: true })
  public '3': null | string;
  @Column({ nullable: true })
  public '4': null | string;
  @Column({ nullable: true })
  public '5': null | string;
  @Column({ nullable: true })
  public '6': null | string;
  @Column({ nullable: true })
  public '7': null | string;
  @Column({ nullable: true })
  public '8': null | string;
  @Column({ nullable: true })
  public '9': null | string;
  @Column({ nullable: true })
  public '10': null | string;
  @Column({ nullable: true })
  public '11': null | string;
  @Column({ nullable: true })
  public '12': null | string;
  @Column({ nullable: true })
  public '13': null | string;
  @Column({ nullable: true })
  public '14': null | string;
  @Column({ nullable: true })
  public '15': null | string;
  @Column({ nullable: true })
  public '16': null | string;
  @Column({ nullable: true })
  public '17': null | string;
  @Column({ nullable: true })
  public '18': null | string;
  @Column({ nullable: true })
  public '19': null | string;
  @Column({ nullable: true })
  public '20': null | string;
  @Column({ nullable: true })
  public '21': null | string;
  @Column({ nullable: true })
  public '22': null | string;
  @Column({ nullable: true })
  public '23': null | string;
  @Column({ nullable: true })
  public '24': null | string;
  @Column({ nullable: true })
  public '25': null | string;
  @Column({ nullable: true })
  public '26': null | string;
  @Column({ nullable: true })
  public '27': null | string;
  @Column({ nullable: true })
  public '28': null | string;
  @Column({ nullable: true })
  public '29': null | string;
  @Column({ nullable: true })
  public '30': null | string;
  @Column({ nullable: true })
  public '31': null | string;
  @Column({ nullable: true })
  public '32': null | string;
  @Column({ nullable: true })
  public '33': null | string;
  @Column({ nullable: true })
  public '34': null | string;
  @Column({ nullable: true })
  public '35': null | string;
  @Column({ nullable: true })
  public '36': null | string;
  @Column({ nullable: true })
  public '37': null | string;
  @Column({ nullable: true })
  public '38': null | string;
  @Column({ nullable: true })
  public '39': null | string;
  @Column({ nullable: true })
  public '40': null | string;
  @Column({ nullable: true })
  public '41': null | string;
  @Column({ nullable: true })
  public '42': null | string;
  @Column({ nullable: true })
  public '43': null | string;
  @Column({ nullable: true })
  public '44': null | string;
  @Column({ nullable: true })
  public '45': null | string;
  @Column({ nullable: true })
  public '46': null | string;
  @Column({ nullable: true })
  public '47': null | string;
  @Column({ nullable: true })
  public '48': null | string;
  @Column({ nullable: true })
  public '49': null | string;
  @Column({ nullable: true })
  public '50': null | string;
  @Column({ nullable: true })
  public '51': null | string;
  @Column({ nullable: true })
  public '52': null | string;
  @Column({ nullable: true })
  public '53': null | string;
  @Column({ nullable: true })
  public '54': null | string;
  @Column({ nullable: true })
  public '55': null | string;
  @Column({ nullable: true })
  public '56': null | string;
  @Column({ nullable: true })
  public '57': null | string;
  @Column({ nullable: true })
  public '58': null | string;
  @Column({ nullable: true })
  public '59': null | string;
  @Column({ nullable: true })
  public '60': null | string;
  @Column({ nullable: true })
  public '61': null | string;
  @Column({ nullable: true })
  public '62': null | string;
  @Column({ nullable: true })
  public '63': null | string;
  @Column({ nullable: true })
  public '64': null | string;
  @Column({ nullable: true })
  public '65': null | string;
  @Column({ nullable: true })
  public '66': null | string;
  @Column({ nullable: true })
  public '67': null | string;
  @Column({ nullable: true })
  public '68': null | string;
  @Column({ nullable: true })
  public '69': null | string;
  @Column({ nullable: true })
  public '70': null | string;
  @Column({ nullable: true })
  public '71': null | string;
  @Column({ nullable: true })
  public '72': null | string;
  @Column({ nullable: true })
  public '73': null | string;
  @Column({ nullable: true })
  public '74': null | string;
  @Column({ nullable: true })
  public '75': null | string;
  @Column({ nullable: true })
  public '76': null | string;
  @Column({ nullable: true })
  public '77': null | string;
  @Column({ nullable: true })
  public '78': null | string;
  @Column({ nullable: true })
  public '79': null | string;
  @Column({ nullable: true })
  public '80': null | string;
  @Column({ nullable: true })
  public '81': null | string;
  @Column({ nullable: true })
  public '82': null | string;
  @Column({ nullable: true })
  public '83': null | string;
  @Column({ nullable: true })
  public '84': null | string;
  @Column({ nullable: true })
  public '85': null | string;
  @Column({ nullable: true })
  public '86': null | string;
  @Column({ nullable: true })
  public '87': null | string;
  @Column({ nullable: true })
  public '88': null | string;
  @Column({ nullable: true })
  public '89': null | string;
  @Column({ nullable: true })
  public '90': null | string;
  @Column({ nullable: true })
  public '91': null | string;
  @Column({ nullable: true })
  public '92': null | string;
  @Column({ nullable: true })
  public '93': null | string;
  @Column({ nullable: true })
  public '94': null | string;
  @Column({ nullable: true })
  public '95': null | string;
  @Column({ nullable: true })
  public '96': null | string;
  @Column({ nullable: true })
  public '97': null | string;
  @Column({ nullable: true })
  public '98': null | string;
  @Column({ nullable: true })
  public '99': null | string;
  @Column({ nullable: true })
  public '100': null | string;
  @Column({ nullable: true })
  public '101': null | string;
  @Column({ nullable: true })
  public '102': null | string;
  @Column({ nullable: true })
  public '103': null | string;
  @Column({ nullable: true })
  public '104': null | string;
  @Column({ nullable: true })
  public '105': null | string;
  @Column({ nullable: true })
  public '106': null | string;
  @Column({ nullable: true })
  public '107': null | string;
  @Column({ nullable: true })
  public '108': null | string;
  @Column({ nullable: true })
  public '109': null | string;
  @Column({ nullable: true })
  public '110': null | string;
  @Column({ nullable: true })
  public '111': null | string;
  @Column({ nullable: true })
  public '112': null | string;
  @Column({ nullable: true })
  public '113': null | string;
  @Column({ nullable: true })
  public '114': null | string;
  @Column({ nullable: true })
  public '115': null | string;
  @Column({ nullable: true })
  public '116': null | string;
  @Column({ nullable: true })
  public '117': null | string;
  @Column({ nullable: true })
  public '118': null | string;
  @Column({ nullable: true })
  public '119': null | string;
  @Column({ nullable: true })
  public '120': null | string;
  @Column({ nullable: true })
  public '121': null | string;
  @Column({ nullable: true })
  public '122': null | string;
  @Column({ nullable: true })
  public '123': null | string;
  @Column({ nullable: true })
  public '124': null | string;
  @Column({ nullable: true })
  public '125': null | string;

  @BeforeUpdate()
  insertUpdated() {
    this.updateAt = DateTime.now().setZone('Europe/Moscow').toJSDate();
  }
}
