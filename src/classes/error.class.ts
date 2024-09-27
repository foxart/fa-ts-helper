interface ErrorClassInterface {
  name: string;
  message: string | object;
  stack?: string;
  status?: number;
}

export class ErrorClass extends Error {
  public readonly data: string | object;

  public readonly status: number;

  public constructor(error: string | Error | ErrorClassInterface) {
    super();
    if (typeof error === 'string') {
      this.name = ErrorClass.name;
      this.data = error;
      this.status = 500;
    } else if (error instanceof Error) {
      this.name = error.name;
      this.data = error.message;
      this.status = 500;
    } else {
      this.name = error.name;
      this.data = error.message;
      this.status = error.status || 500;
      this.stack = error.stack ? error.stack : this.stack;
    }
  }
}
