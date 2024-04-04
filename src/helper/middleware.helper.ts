export class MiddlewareHelper {
  private readonly middleware: [(next: (...nextArgs: unknown[]) => void, ...args: any[]) => void];

  public constructor() {
    this.middleware = [(next) => next()];
  }

  public add(middleware: (next: (...nextArgs: unknown[]) => void, ...args: any[]) => void) {
    this.middleware.push(middleware);
  }

  public use(next: (...nextArgs: unknown[]) => void, ...args: any[]): void {
    const runner = (func: Function, curr: number, funcArgs: any[]) => {
      if (curr <= prev) {
        throw new Error('multiple calls');
      }
      prev = curr;
      if (curr === this.middleware.length) {
        func(...funcArgs);
      } else {
        this.middleware[curr](
          (...data) => {
            funcArgs.splice(0, data.length);
            data.push(...funcArgs);
            runner(func, curr + 1, data);
          },
          ...funcArgs,
        );
      }
    };
    let prev = 0;
    runner(next, 1, args);
  }
}
