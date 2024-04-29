import { NestLoggerService } from '../../src';

export function ConsoleExample(): void {
  const data = { number: 1, string: 'lorem ipsum', date: new Date() };
  const error = new Error('Custom error');
  const nestLogger = new NestLoggerService('API');
  // consoleLog(data);
  // consoleInfo(data);
  // consoleWarn(data);
  // consoleError(error);
  // consoleDebug(data);
  // Console.debug(consoleLog.name);
  // console.log(1, '2', '3', 'xxx', 'yyy');
  // console.info(1, '2', '3', 'xxx', 'yyy');
  nestLogger.log(data, 'Class1');
  nestLogger.error(new Error('XXX'), 'Class1');
  nestLogger.debug(123, 'Class1');
  // nestLogger.error('error', 'Function1');
}
