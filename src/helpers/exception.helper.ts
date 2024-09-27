import * as mongoose from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorClass } from '../classes/error.class';

export enum ExceptionTypeEnum {
  HTTP_EXCEPTION = 'HttpException',
  MONGO_ERROR = 'MongoError',
  ERROR_CLASS = 'ErrorClass',
  ERROR = 'Error',
  UNKNOWN = 'Unknown',
}

export interface ExceptionInterface {
  name: string;
  data: unknown;
  type: ExceptionTypeEnum;
  status: number;
  stack?: string;
}

class ExceptionSingleton {
  private static self: ExceptionSingleton;

  public static getInstance(): ExceptionSingleton {
    if (!ExceptionSingleton.self) {
      ExceptionSingleton.self = new ExceptionSingleton();
    }
    return ExceptionSingleton.self;
  }

  public castError(error: Error | unknown): ExceptionInterface {
    let result;
    if (error instanceof HttpException) {
      result = this.castToHttpException(error);
    } else if (error instanceof mongoose.mongo.MongoError) {
      result = this.castToMongoError(error);
    } else if (error instanceof ErrorClass) {
      result = this.castToErrorClass(error);
    } else if (error instanceof Error) {
      result = this.castToError(error);
    } else {
      result = this.castToUnknown(error);
    }
    return result;
  }

  private castToHttpException(exception: HttpException): ExceptionInterface {
    const response = exception.getResponse();
    return {
      name: typeof response === 'string' ? response : exception.name,
      data: typeof response === 'object' ? response : exception.message,
      type: ExceptionTypeEnum.HTTP_EXCEPTION,
      status: exception.getStatus(),
      stack: exception.stack,
    };
  }

  private castToMongoError(exception: mongoose.mongo.MongoError): ExceptionInterface {
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
      data: message,
      type: ExceptionTypeEnum.MONGO_ERROR,
      status: HttpStatus.BAD_REQUEST,
      stack: exception.stack,
    };
  }

  private castToErrorClass(exception: ErrorClass): ExceptionInterface {
    return {
      name: exception.name,
      data: exception.data,
      type: ExceptionTypeEnum.ERROR_CLASS,
      status: exception.status,
      stack: exception.stack,
    };
  }

  private castToError(exception: Error): ExceptionInterface {
    return {
      name: exception.name,
      data: exception.message,
      type: ExceptionTypeEnum.ERROR,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      stack: exception.stack,
    };
  }

  private castToUnknown(exception: unknown): ExceptionInterface {
    return {
      name: ExceptionSingleton.name,
      data: exception,
      type: ExceptionTypeEnum.UNKNOWN,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      stack: new Error().stack,
    };
  }
}

export const ExceptionHelper = ExceptionSingleton.getInstance();
