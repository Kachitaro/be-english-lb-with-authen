import {BeEnglishLbWithAuthenApplication} from '../application';
import {MigrationsRepository} from '../repositories';
import {processes} from './processes';

export default async (app: BeEnglishLbWithAuthenApplication) => {
  const migrateRepository = await app.getRepository(MigrationsRepository);
  for (const process of processes) {

    try {
      const found = await migrateRepository.findOne({ where: { name: process.name } });
      if (found) {
        continue;
      } else {
        await process.func(app);
        await migrateRepository.create({ name: process.name });
      }
    } catch (err) {
      console.error(`Error executing migration '${process.name}': ${err}`);
      throw err;
    }
  }
};
