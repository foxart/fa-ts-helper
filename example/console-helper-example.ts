import { ConsoleHelper } from '../src';

const Console = new ConsoleHelper({ date: true, info: false, link: false });

function consoleLog(data: unknown): void {
  Console.info(consoleLog.name);
  console.log(data);
  Console.stdout('\n');
}

function consoleInfo(data: unknown): void {
  Console.info(consoleInfo.name);
  console.info(data);
  Console.stdout('\n');
}

function consoleWarn(data: unknown): void {
  Console.info(consoleWarn.name);
  console.warn(data);
  Console.stdout('\n');
}

function consoleError(data: unknown): void {
  Console.info(consoleError.name);
  console.error(data);
  Console.stdout('\n');
}

function consoleDebug(data: unknown): void {
  Console.info(consoleDebug.name);
  console.debug(data);
  Console.stdout('\n');
}

export function ConsoleHelperExample(): void {
  const data = { number: 1, string: 'lorem ipsum', date: new Date() };
  const error = new Error('Custom error');
  consoleLog(data);
  consoleInfo(data);
  consoleWarn(data);
  consoleError(error);
  consoleDebug(data);
}
