import { SystemHelper } from '../helpers/system.helper';

async function testSleep(): Promise<void> {
  const timeStart = performance.now();
  await SystemHelper.sleep(1000);
  const timeEnd = performance.now();
  console.log({ start: timeStart, end: timeEnd, duration: timeEnd - timeStart });
}

function testWriteFile(): void {
  const data = [1, { object: { a: 1 } }];
  SystemHelper.writeFileSync('./temp/system.json', JSON.stringify(data));
}

function testForFiles(filter: RegExp): void {
  const result = SystemHelper.scanForFilesSync('./temp', true, [filter]);
  console.log(result);
}

function testForDirectories(filter: RegExp): void {
  const result = SystemHelper.scanForDirectoriesSync('./temp', true, [filter]);
  console.log(result);
}

void (async function (): Promise<void> {
  console.clear();
  // await testSleep();
  // testWriteFile();
  // testForFiles(/.+-1\.txt$/);
  testForDirectories(/.+-2$/);
})();
