import { ConsoleService } from '../src';
import process from 'process';
import { ConsoleExample } from './services/console.example';
import { DataExample } from './helpers/data.example';
import { CodegenExample } from './helpers/codegen.example';
import { parserExample } from './helpers/parser.example';

function initCatch(): void {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('unhandledRejection', reason, promise);
  });
  process.on('uncaughtException', (err, origin) => {
    console.error('uncaughtException', err, origin);
  });
}

function initConsole(): void {
  console.clear();
  const Console = new ConsoleService({
    // name: 'CONTEXT',
    // date: true,
    counter: true,
    info: true,
    performance: false,
    index: 2,
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
void ((): void => {
  console.clear();
  initConsole();
  // initCatch();
  // CodegenExample();
  // ConsoleExample();
  // DataExample();
  // void import('./services/decorator-test').then((module) => module.decoratorTest());
  // void import('./services/decorator-entity.example').then((module) => module.decoratorEntityExample());
  parserExample();
})();
