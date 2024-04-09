import { ConsoleHelper } from '../src';
import { testDecoratorHelper } from './test-decorator-helper';
import process from 'process';

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
  const Console = new ConsoleHelper({ date: false, info: true });
  console.log = Console.log.bind(Console);
  console.info = Console.info.bind(Console);
  console.warn = Console.warn.bind(Console);
  console.error = Console.error.bind(Console);
  console.debug = Console.debug.bind(Console);
}
/**
 *
 * */
void ((): void => {
  initCatch();
  initConsole();
  // ConsoleHelperExample();
  // testCryptHelper();
  // testMiddlewareHelper();
  // testParamDecorator();
  testDecoratorHelper();
  // void testSystemHelper();
  // void testValidatorHelper();
})();
