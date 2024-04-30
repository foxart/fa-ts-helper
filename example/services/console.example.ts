import { NestLoggerService } from '../../src';

export function ConsoleExample(): void {
  const message = 'lorem ipsum';
  const data = { number: 1, string: message, date: new Date() };
  const error = new Error('Custom error');
  const nestLogger = new NestLoggerService({
    counter: true,
    name: 'LOGGER',
    info: false,
    performance: true,
    link: false,
  });
  // consoleLog(data);
  // consoleInfo(data);
  // consoleWarn(data);
  // consoleError(error);
  // consoleDebug(data);
  // Console.debug(consoleLog.name);
  // console.log(1, '2', '3', 'xxx', 'yyy');
  // console.info(1, '2', '3', 'xxx', 'yyy');
  console.log('Class1');
  nestLogger.log(undefined, 'Class1');
  nestLogger.log(error, 'Class1');
  nestLogger.info(message, 'Class1');
  nestLogger.warn(message, 'Class1');
  nestLogger.error(message, 'Class1');
  nestLogger.debug(message, 'Class1');
  // nestLogger.error('error', 'Function1');
}
