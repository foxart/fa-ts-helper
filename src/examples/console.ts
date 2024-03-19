import { ConsoleHelper } from '../helpers/console.helper';

function test(): void {
  /** */
  // const data = new Error('My Error');
  const data = { a: 1 };
  /** */
  console.log(data);
  console.info(data);
  console.warn(data);
  console.error(data);
  console.debug(data);
}

void ((): void => {
  console.clear();
  const Console = new ConsoleHelper({ level: 1 });
  console.log = Console.log.bind(Console);
  console.info = Console.info.bind(Console);
  console.warn = Console.warn.bind(Console);
  console.error = Console.error.bind(Console);
  console.debug = Console.debug.bind(Console);
  test();
})();
