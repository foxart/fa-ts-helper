import { initConsole } from '../index';

export function ConsoleServiceExample(): void {
  initConsole();
  const message = 'lorem ipsum';
  const data = { number: 1, string: message, date: new Date() };
  const error = new Error('Custom error');
  console.log(data);
  console.info(data);
  console.warn(data);
  console.error(error);
  console.debug(data);
}
