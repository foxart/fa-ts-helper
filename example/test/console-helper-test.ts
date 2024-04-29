import { ConsoleHelper } from '../../src';

const Console = new ConsoleHelper({ date: true, info: true, link: true });

function consoleLog(data: unknown): void {
  Console.info(consoleLog.name);
  console.log(data);
}

function consoleInfo(data: unknown): void {
  Console.info(consoleInfo.name);
  console.info(data);
}

function consoleWarn(data: unknown): void {
  Console.info(consoleWarn.name);
  console.warn(data);
}

function consoleError(data: unknown): void {
  Console.info(consoleError.name);
  console.error(data);
}

function consoleDebug(data: unknown): void {
  Console.info(consoleDebug.name);
  console.debug(data);
}

export function ConsoleHelperTest(): void {
  const data = { number: 1, string: 'lorem ipsum', date: new Date() };
  const error = new Error('Custom error');
  // consoleLog(data);
  // consoleInfo(data);
  // consoleWarn(data);
  // consoleError(error);
  // consoleDebug(data);
  // Console.debug(consoleLog.name);
  console.log(1, '2', '3', 'xxx', 'yyy');
}
