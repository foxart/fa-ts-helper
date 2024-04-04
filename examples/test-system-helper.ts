import { CryptHelper, SystemHelper } from '../src';
import { logNameData } from './common/logger';

async function sleep(milliseconds: number): Promise<void> {
  const timeStart = performance.now();
  await SystemHelper.sleep(milliseconds);
  const timeEnd = performance.now();
  logNameData(sleep.name, {
    start: timeStart,
    end: timeEnd,
    duration: timeEnd - timeStart,
  });
}

function writeFile(filePath: string, data: string): void {
  SystemHelper.createFileSync(filePath, data);
  logNameData(writeFile.name, { filePath, data });
}

function scanFiles(directory: string, filter?: RegExp[]): void {
  const result = SystemHelper.scanFilesSync(directory, filter);
  logNameData(scanFiles.name, { filter, result });
}

function scanDirectories(directory: string, filter?: RegExp[]): void {
  const result = SystemHelper.scanDirectoriesSync(directory, filter);
  logNameData(scanDirectories.name, { filter, result });
}

export async function testSystemHelper(): Promise<void> {
  const directory = './temp';
  const data = { name: 'Иван123', password: CryptHelper.bcryptSalt() };
  await sleep(100);
  writeFile(`${directory}/temp.json`, JSON.stringify(data, null, 4));
  scanFiles(directory);
  scanFiles(directory, [/.+-1\.txt$/]);
  scanDirectories(directory);
  scanDirectories(directory, [/.+-2$/]);
}
