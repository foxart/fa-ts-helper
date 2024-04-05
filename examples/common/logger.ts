import process from 'process';
import { ConsoleColorHelper, ConsoleHelper } from '../../src';

const ConsoleLog = new ConsoleHelper({ index: 2 });

export function logNameData(name: string, ...data: unknown[]): void {
  [
    '\n',
    '[',
    ConsoleColorHelper.effect.bright,
    ConsoleColorHelper.foreground.yellow,
    name.toUpperCase(),
    ConsoleColorHelper.effect.reset,
    ']',
    ' ',
  ].forEach((item) => {
    process.stdout.write(item);
  });
  if (data.length) {
    ConsoleLog.log(...data);
  }
}

export function logData(...data: unknown[]): void {
  process.stdout.write('\n');
  ConsoleLog.log(...data);
}
