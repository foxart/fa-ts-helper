import { ConsoleService } from '../index';
import process from 'process';

export function initCatch(): void {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('unhandledRejection', reason, promise);
  });
  process.on('uncaughtException', (err, origin) => {
    console.error('uncaughtException', err, origin);
  });
}

export function initConsole(): void {
  Array.from(Array(10).keys()).forEach(() => console.log('|'));
  const Console = new ConsoleService({
    name: 'CONTEXT',
    color: true,
    counter: true,
    date: true,
    info: true,
    link: true,
    index: 2,
    // hidden: true,
    // performance: true,
  });
  console.log = (...args: unknown[]): void => {
    Console.log(...args);
    Console.stdout('\n');
  };
  console.info = (...args: unknown[]): void => {
    Console.info(...args);
    Console.stdout('\n');
  };
  console.warn = (...args: unknown[]): void => {
    Console.warn(...args);
    Console.stdout('\n');
  };
  console.error = (...args: unknown[]): void => {
    Console.error(...args);
    Console.stdout('\n');
  };
  console.debug = (...args: unknown[]): void => {
    Console.debug(...args);
    Console.stdout('\n');
  };
}

/**
 *
 */
initCatch();
initConsole();
// CodegenHelperExample();
// ConsoleServiceExample();
// void import('./data.example').then((module) => module.DataExample());
// DecoratorServiceExample();
// void import('./decorator-service.example').then((module) => module.runDecoratorServiceSync());
void import('./decorator-service.example').then((module) => module.runDecoratorServiceAsync());
// parserExample();
// void import('./decorator-service.example').then((module) => module.run());
