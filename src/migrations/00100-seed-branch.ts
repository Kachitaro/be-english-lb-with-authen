import fs from 'fs';
import path from 'path';
import {BeEnglishLbWithAuthenApplication} from '../application';
import {CenterBranchRepository} from '../repositories/center-branch.repository';
import {Process} from './processes';
const filePath = path.join(__dirname, '../../data/center-branch.csv');

export const seedBranch: Process = {
  name: '00100-seed-branch.ts',
  func: async (app:BeEnglishLbWithAuthenApplication ) => {
    try {
      const centerBranchRepository = await app.getRepository(CenterBranchRepository);
      const csvString = fs.readFileSync(filePath, 'utf-8');
      const lines = csvString.split('\n');
      // loop through all the lines in the CSV data, starting from the second line
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const newBranch = {
          name: values[0],
          address: values[1],
          phoneNumber: values[2]
        };
        await centerBranchRepository.create(newBranch);
      }
      console.log('Successful');
    } catch (error) {
      console.log('Fail');
    }
  }
}
