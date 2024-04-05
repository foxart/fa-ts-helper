type MiddlewareNextType<T> = (payload: T) => void;
type MiddlewareType<T> = (payload: T, next: MiddlewareNextType<T>) => void;

export class MiddlewareHelper<PAYLOAD> {
  private readonly middleware: MiddlewareType<PAYLOAD>[];

  public constructor() {
    this.middleware = [];
  }

  public add(middleware: MiddlewareType<PAYLOAD>): void {
    this.middleware.push(middleware);
  }

  public use(payload: PAYLOAD, next: MiddlewareNextType<PAYLOAD>): void {
    this.executor(payload, next, 0, 0);
  }

  private executor(payload: PAYLOAD, next: MiddlewareNextType<PAYLOAD>, current: number, previous: number): void {
    if (current < previous) {
      throw new Error('multiple calls');
    }
    previous = current;
    if (current === this.middleware.length) {
      next(payload);
    } else {
      this.middleware[current](payload, (data) => {
        this.executor(data, next, current + 1, previous);
      });
    }
  }
}
