import {BeEnglishLbWithAuthenApplication} from '../application';
import {seedBranch} from './00100-seed-branch';

export  interface Process{
  name: string,
  func: (app: BeEnglishLbWithAuthenApplication) => Promise<void>
}
export const processes: Process[] = [seedBranch]
