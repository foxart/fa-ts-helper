import { ConsoleService } from '../index';
import process from 'process';
import { DataExample } from './data.example';
import { DecoratorServiceExample } from './decorator-service.example';

export function initCatch(): void {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('unhandledRejection', reason, promise);
  });
  process.on('uncaughtException', (err, origin) => {
    console.error('uncaughtException', err, origin);
  });
}

export function initConsole(): void {
  const Console = new ConsoleService({
    name: 'CONTEXT',
    color: true,
    counter: true,
    date: true,
    info: true,
    link: true,
    index: 2,
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
 * */
// console.clear();
initConsole();
void ((): void => {
  // CodegenHelperExample();
  // ConsoleServiceExample();
  // DataExample();
  DecoratorServiceExample();
  // void import('./decorator-service.example').then((module) => module.DecoratorServiceExample());
  // void import('./services/decorator-entity.example').then((module) => module.decoratorEntityExample());
  // parserExample();
})();
