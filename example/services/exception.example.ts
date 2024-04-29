import { ExceptionService } from '../../src';

export function exceptionExample(): void {
  try {
    // @ts-ignore
    a = 1;
  } catch (e: unknown) {
    const exceptionHelper = new ExceptionService({
      short: true,
      callback: (stack: string[]): string[] => {
        return stack.filter((item) => {
          return item.indexOf('node_modules/@nestjs') !== -1 || item.indexOf('node_modules') === -1;
        });
      },
    });
    const result = exceptionHelper.parse(e);
    console.log(result);
  }
}
