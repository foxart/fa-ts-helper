import { ConverterHelper } from '../helpers/converter.helper';

interface ErrorServiceInterface {
  name: string;
  message: unknown;
  status?: number;
  stack?: string;
}

export class ErrorService extends Error {
  public readonly status: number;

  public constructor(error: string | Error | ErrorServiceInterface) {
    super();
    if (typeof error === 'string') {
      this.name = ErrorService.name;
      this.message = error;
      this.status = 500;
    } else if (error instanceof Error) {
      this.name = error.name;
      this.message = error.message;
      this.status = 500;
      this.stack = error.stack ? error.stack : this.stack;
    } else {
      this.name = error.name;
      // this.message =
      //   typeof error.message === 'object' ? ConverterHelper.dataToJson(error.message) : String(error.message);
      this.message = <string>error.message;
      this.status = error.status ?? 500;
      this.stack = error.stack ? error.stack : this.stack;
    }
  }
}
