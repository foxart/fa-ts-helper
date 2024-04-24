import * as mongoose from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorHelper } from './error.helper';
import { ParserHelper } from './parser.helper';

interface ExceptionInterface {
  name: string;
  message: unknown;
  status: number;
  type: string;
  stack: string[];
}

interface ExceptionOptionInterface {
  short?: boolean;
  index?: number;
  callback?: (stack: string[]) => string[];
}

export class ExceptionHelper {
  public readonly options?: ExceptionOptionInterface;

  public constructor(options?: ExceptionOptionInterface) {
    this.options = options;
  }

  public parse(exception: unknown): ExceptionInterface {
    let result;
    if (exception instanceof HttpException) {
      result = this.parseHttpException(exception);
    } else if (exception instanceof mongoose.mongo.MongoError) {
      result = this.parseMongoException(exception);
    } else if (exception instanceof ErrorHelper) {
      result = this.parseErrorHelperException(exception);
    } else if (exception instanceof Error) {
      result = this.parseErrorException(exception);
    } else {
      result = this.parseUnknownException(exception);
    }
    return result;
  }

  private stack(stack?: string): string[] {
    const result = ParserHelper.stack(stack, {
      short: this.options?.short,
      index: this.options?.index,
    });
    if (this.options?.callback) {
      return this.options.callback(result);
    } else {
      return result;
    }
  }

  private parseHttpException(exception: HttpException): ExceptionInterface {
    const response = exception.getResponse();
    return {
      name: typeof response === 'string' ? response : exception.name,
      message: typeof response === 'object' ? response : exception.message,
      status: exception.getStatus(),
      // type: 'http',
      type: HttpException.name,
      stack: this.stack(exception.stack),
    };
  }

  private parseMongoException(exception: mongoose.mongo.MongoError): ExceptionInterface {
    let message;
    switch (exception.code) {
      case 11000:
        const field = exception.message.match(/E([0-9]+) (.+) collection: (.+) index: (.+) dup key: ({ .+ })/);
        message = field
          ? {
              error: field[2],
              code: parseInt(field[1]),
              collection: field[3],
              index: field[4],
              data: field[5],
            }
          : exception.message;
        break;
      default:
        message = exception.message;
    }
    return {
      name: exception.name,
      message: message,
      status: HttpStatus.BAD_REQUEST,
      // type: 'mongo',
      type: mongoose.mongo.MongoError.name,
      stack: this.stack(exception.stack),
    };
  }

  private parseErrorHelperException(exception: ErrorHelper): ExceptionInterface {
    let message;
    try {
      message = JSON.parse(exception.message) as unknown;
    } catch (err) {
      message = exception.message;
    }
    return {
      name: exception.name,
      message: message,
      status: exception.status,
      // type: 'helper',
      type: ErrorHelper.name,
      stack: this.stack(exception.stack),
    };
  }

  private parseErrorException(exception: Error): ExceptionInterface {
    return {
      name: exception.name,
      message: exception.message,
      status: 500,
      // type: 'error',
      type: Error.name,
      stack: this.stack(exception.stack),
    };
  }

  private parseUnknownException(exception: unknown): ExceptionInterface {
    return {
      name: 'UnknownException',
      message: exception,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      type: 'unknown',
      stack: this.stack(new Error().stack),
    };
  }
}
