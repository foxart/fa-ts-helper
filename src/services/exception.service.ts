import * as mongoose from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorService } from './error.service';
import { ParserHelper } from '../helpers/parser.helper';

export interface ExceptionInterface {
  name: string;
  message: unknown;
  status: number;
  timestamp: string;
  stack: string[];
}

interface ExceptionOptionInterface {
  short?: boolean;
  callback?: (stack: string[]) => string[];
}

export class ExceptionService {
  public constructor(private readonly options?: ExceptionOptionInterface) {}

  public parse(exception: unknown): ExceptionInterface {
    let result;
    if (exception instanceof HttpException) {
      result = this.parseHttpException(exception);
      // console.log('HttpException');
    } else if (exception instanceof mongoose.mongo.MongoError) {
      result = this.parseMongoException(exception);
      // console.log('MongoError');
    } else if (exception instanceof ErrorService) {
      result = this.parseErrorServiceException(exception);
      // console.log('ErrorService');
    } else if (exception instanceof Error) {
      // console.log('Error');
      result = this.parseErrorException(exception);
    } else {
      // console.log('Unknown');
      result = this.parseUnknownException(exception);
    }
    return result;
  }

  private getStack(stack?: string): string[] {
    const result = ParserHelper.stack(stack, { full: this.options?.short });
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
      timestamp: new Date().toISOString(),
      stack: this.getStack(exception.stack),
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
      timestamp: new Date().toISOString(),
      stack: this.getStack(exception.stack),
    };
  }

  private parseErrorServiceException(exception: ErrorService): ExceptionInterface {
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
      timestamp: new Date().toISOString(),
      stack: this.getStack(exception.stack),
    };
  }

  private parseErrorException(exception: Error): ExceptionInterface {
    return {
      name: exception.name,
      message: exception.message,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      stack: this.getStack(exception.stack),
    };
  }

  private parseUnknownException(exception: unknown): ExceptionInterface {
    return {
      name: ExceptionService.name,
      message: exception,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      stack: this.getStack(new Error().stack),
    };
  }
}
