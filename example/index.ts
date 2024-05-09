import { ConsoleService } from '../src';
import process from 'process';
import { ConsoleExample } from './services/console.example';
import { DataExample } from './helpers/data.example';

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
    name: 'CONTEXT',
    date: true,
    counter: true,
    info: true,
    performance: true,
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
  initConsole();
  initCatch();
  DataExample();
  // ConsoleExample();
  // testCryptHelper();
  // testMiddlewareHelper();
  // void import('./services/decorator-test').then((module) => module.decoratorTest());
  // void import('./decorator/test-decorator-entity').then((module) => module.testDecoratorEntity());
  // void testSystemHelper();
  // void testValidatorHelper();
  // void testExceptionHelper();
})();
