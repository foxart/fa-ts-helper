import { ConsoleHelper } from '../src';

const Console = new ConsoleHelper({ link: false });

function setConsole(): void {
  console.log = Console.log.bind(Console);
  console.info = Console.info.bind(Console);
  console.warn = Console.warn.bind(Console);
  console.error = Console.error.bind(Console);
  console.debug = Console.debug.bind(Console);
}

function resetConsole(): void {
  console.log = Console.console.log.bind(console);
  console.info = Console.console.info.bind(console);
  console.warn = Console.console.warn.bind(console);
  console.error = Console.console.error.bind(console);
  console.debug = Console.console.debug.bind(console);
}

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

export function testConsoleHelper(): void {
  const data = { number: 1, string: 'lorem ipsum', date: new Date() };
  const error = new Error('Custom error');
  setConsole();
  consoleLog(data);
  consoleInfo(data);
  consoleWarn(data);
  consoleError(error);
  consoleDebug(data);
  resetConsole();
}
