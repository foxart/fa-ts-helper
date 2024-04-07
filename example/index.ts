import { ConsoleHelper } from '../src';
import { testDecoratorHelper } from './test-decorator-helper';

const Console = new ConsoleHelper({ date: false, info: true });
console.log = Console.log.bind(Console);
console.info = Console.info.bind(Console);
console.warn = Console.warn.bind(Console);
console.error = Console.error.bind(Console);
console.debug = Console.debug.bind(Console);
console.clear();
/**
 *
 * */
void ((): void => {
  // ConsoleHelperExample();
  // testCryptHelper();
  // testMiddlewareHelper();
  // testParamDecorator();
  testDecoratorHelper();
  // void testSystemHelper();
  // void testValidatorHelper();
})();
