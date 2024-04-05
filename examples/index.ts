import { testConsoleHelper } from './test-console-helper';
import { testCryptHelper } from './test-crypt-helper';
import { testMiddlewareHelper } from './test-middleware-helper';
import { testSystemHelper } from './test-system-helper';
import { testValidatorHelper } from './test-validator-helper';
import { testParamDecorator } from './test-param-decorator';

/**
 *
 */
void ((): void => {
  // testConsoleHelper();
  // testCryptHelper();
  // testMiddlewareHelper();
  testParamDecorator();
  // void testSystemHelper();
  // void testValidatorHelper();
})();
