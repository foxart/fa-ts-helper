import { ConsoleHelper, ErrorHelper, ExceptionHelper } from '../src';
import { testDecoratorHelper } from './test/test-decorator-helper';
import process from 'process';
import { testExceptionHelper } from './test/test-exception-helper';
import { ConsoleTest } from './test/console.test';

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
  const Console = new ConsoleHelper({ date: false, info: true, index: 2 });
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
  ConsoleTest();
  // testCryptHelper();
  // testMiddlewareHelper();
  // testDecoratorHelper();
  // void testSystemHelper();
  // void testValidatorHelper();
  // void testExceptionHelper();
})();
