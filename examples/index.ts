import { ConsoleHelper } from '../src';
/**
 *
 * */
import { testParamDecorator } from './test-param-decorator';

const Console = new ConsoleHelper();
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
  // testConsoleHelper();
  // testCryptHelper();
  // testMiddlewareHelper();
  testParamDecorator();
  // void testSystemHelper();
  // void testValidatorHelper();
})();
