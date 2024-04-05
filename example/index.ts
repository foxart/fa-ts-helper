import { ConsoleHelper } from '../src';
/**
 *
 * */
import { testParamDecorator } from './test-param-decorator';
import { ConsoleHelperExample } from './console-helper-example';

const Console = new ConsoleHelper({ date: false });
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
  ConsoleHelperExample();
  // testCryptHelper();
  // testMiddlewareHelper();
  // testParamDecorator();
  // void testSystemHelper();
  // void testValidatorHelper();
})();
