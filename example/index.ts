import { ConsoleHelper, ErrorHelper, ExceptionHelper } from '../src';
import { decoratorHelperTest } from './test/decorator-helper-test';
import process from 'process';
import { exceptionHelperTest } from './test/exception-helper-test';
import { ConsoleHelperTest } from './test/console-helper-test';

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
  const Console = new ConsoleHelper({ context: 'CONTEXT', date: false, info: true, index: 2 });
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
  ConsoleHelperTest();
  // testCryptHelper();
  // testMiddlewareHelper();
  // testDecoratorHelper();
  // void testSystemHelper();
  // void testValidatorHelper();
  // void testExceptionHelper();
})();
