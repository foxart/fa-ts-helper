import { HttpException, HttpStatus } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { ErrorClass, ErrorClassInterface } from '../classes/error.class';
import {
  ExceptionResponseContextEnum,
  ExceptionResponseInterface,
  ExceptionResponseTypeEnum,
} from '../declarations/exception-response.interface';

export interface ExceptionInterface extends ErrorClassInterface {
  type: ExceptionResponseTypeEnum;
}

class ExceptionSingleton {
  private static self: ExceptionSingleton;

  public static getInstance(): ExceptionSingleton {
    if (!ExceptionSingleton.self) {
      ExceptionSingleton.self = new ExceptionSingleton();
    }
    return ExceptionSingleton.self;
  }

  public castToException(error: Error | unknown): ExceptionInterface {
    let result;
    if (error instanceof HttpException) {
      result = this.castHttpException(error);
    } else if (error instanceof mongoose.mongo.MongoError) {
      result = this.castMongoError(error);
    } else if (error instanceof ErrorClass) {
      result = this.castErrorClass(error);
    } else if (error instanceof Error) {
      result = this.castError(error);
    } else {
      result = this.castUnknown(error);
    }
    return result;
  }

  public isExceptionResponse(exception: unknown): exception is ExceptionResponseInterface {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'context' in exception &&
      'name' in exception &&
      'message' in exception &&
      'type' in exception &&
      'status' in exception &&
      'trace' in exception &&
      'payload' in exception &&
      'metadata' in exception &&
      'timestamp' in exception &&
      // Enum checks
      Object.values(ExceptionResponseContextEnum).includes(exception.context as ExceptionResponseContextEnum) &&
      Object.values(ExceptionResponseTypeEnum).includes(exception.type as ExceptionResponseTypeEnum) &&
      // Type checks
      typeof exception.name === 'string' &&
      typeof exception.message === 'string' &&
      typeof exception.status === 'number' &&
      Array.isArray(exception.trace) &&
      exception.trace.every((item: unknown) => {
        return typeof item === 'string';
      }) &&
      typeof exception.timestamp === 'string' &&
      typeof exception.metadata !== 'undefined' &&
      typeof exception.payload === 'object' &&
      exception.payload !== null
    );
  }

  private castHttpException(exception: HttpException): ExceptionInterface {
    const response = exception.getResponse();
    return {
      name: typeof response === 'string' ? response : exception.name,
      // details: typeof response === 'object' ? response : exception.message,
      message: exception.message,
      details: typeof response === 'object' ? response : undefined,
      type: ExceptionResponseTypeEnum.HTTP_EXCEPTION,
      status: exception.getStatus(),
      stack: exception.stack,
    };
  }

  private castMongoError(exception: mongoose.mongo.MongoError): ExceptionInterface {
    let details;
    switch (exception.code) {
      case 11000:
        const message = exception.message.match(/E([0-9]+) (.+) collection: (.+) index: (.+) dup key: ({ .+ })/);
        details = message
          ? {
              error: message[2],
              code: parseInt(message[1]),
              collection: message[3],
              index: message[4],
              data: message[5],
            }
          : undefined;
        break;
      default:
        details = undefined;
    }
    return {
      name: exception.name,
      message: exception.message,
      details: details,
      type: ExceptionResponseTypeEnum.MONGO_ERROR,
      status: HttpStatus.BAD_REQUEST,
      stack: exception.stack,
    };
  }

  private castErrorClass(exception: ErrorClass): ExceptionInterface {
    return {
      name: exception.name,
      message: exception.message,
      details: exception.details,
      type: ExceptionResponseTypeEnum.ERROR_CLASS,
      status: exception.status,
      stack: exception.stack,
    };
  }

  private castError(exception: Error): ExceptionInterface {
    return {
      name: exception.name,
      message: exception.message,
      details: undefined,
      type: ExceptionResponseTypeEnum.ERROR,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      stack: exception.stack,
    };
  }

  private castUnknown(exception: unknown): ExceptionInterface {
    return {
      name: ExceptionSingleton.name,
      message: typeof exception === 'string' ? exception : '',
      details: typeof exception === 'object' && exception !== null ? exception : undefined,
      type: ExceptionResponseTypeEnum.UNKNOWN,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      stack: new Error().stack,
    };
  }
}

export const ExceptionHelper = ExceptionSingleton.getInstance();
