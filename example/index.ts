import { ConsoleHelper } from '../src';

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
  import('../example/test-param-decorator').then((module) => module.testParamDecorator());
  // void testSystemHelper();
  // void testValidatorHelper();
})();
