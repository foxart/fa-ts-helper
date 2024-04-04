import { testConsoleHelper } from './test-console-helper';
import { testCryptHelper } from './test-crypt-helper';
import { testSystemHelper } from './test-system-helper';

console.clear();
/**
 *
 */
void ((): void => {
  // testConsoleHelper();
  // testCryptHelper();
  void testSystemHelper();
})();
