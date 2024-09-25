import * as mongoose from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorService } from './error.service';
import { ParserHelper } from '../helpers/parser.helper';

export interface ExceptionInterface {
  name: string;
  message: unknown;
  type: ExceptionTypeEnum;
  status: number;
  timestamp: string;
  stack: string[];
}

export enum ExceptionTypeEnum {
  'HTTP' = 'Http Exception',
  'GRAPHQL' = 'Graphql Exception',
  'RPC' = 'Rpc Exception',
  'WS' = 'WebSocket Exception',
  'UNKNOWN' = 'Unknown Exception',
}

interface ExceptionOptionInterface {
  short?: boolean;
  index?: number;
  callback?: (stack: string[]) => string[];
}

type ExceptionContextType = 'http' | 'graphql' | 'rpc' | 'ws';

export class ExceptionService {
  public readonly options?: ExceptionOptionInterface;

  public constructor(options?: ExceptionOptionInterface) {
    this.options = options;
  }

  public parse(exception: unknown, context: ExceptionContextType): ExceptionInterface {
    const type = this.getType(context);
    let result;
    if (exception instanceof HttpException) {
      result = this.parseHttpException(exception, type);
    } else if (exception instanceof mongoose.mongo.MongoError) {
      result = this.parseMongoException(exception, type);
    } else if (exception instanceof ErrorService) {
      result = this.parseErrorServiceException(exception, type);
    } else if (exception instanceof Error) {
      result = this.parseErrorException(exception, type);
    } else {
      result = this.parseUnknownException(exception, type);
    }
    return result;
  }

  private getType(context: ExceptionContextType): ExceptionTypeEnum {
    switch (context) {
      case 'http': {
        return ExceptionTypeEnum.HTTP;
      }
      case 'graphql': {
        return ExceptionTypeEnum.GRAPHQL;
      }
      case 'rpc': {
        return ExceptionTypeEnum.RPC;
      }
      case 'ws': {
        return ExceptionTypeEnum.WS;
      }
      default: {
        return ExceptionTypeEnum.UNKNOWN;
      }
    }
  }

  private getStack(stack?: string): string[] {
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

  private parseHttpException(exception: HttpException, type: ExceptionTypeEnum): ExceptionInterface {
    const response = exception.getResponse();
    return {
      name: typeof response === 'string' ? response : exception.name,
      message: typeof response === 'object' ? response : exception.message,
      type: type,
      status: exception.getStatus(),
      timestamp: new Date().toISOString(),
      stack: this.getStack(exception.stack),
    };
  }

  private parseMongoException(exception: mongoose.mongo.MongoError, type: ExceptionTypeEnum): ExceptionInterface {
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
      type: type,
      status: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      stack: this.getStack(exception.stack),
    };
  }

  private parseErrorServiceException(exception: ErrorService, type: ExceptionTypeEnum): ExceptionInterface {
    let message;
    try {
      message = JSON.parse(exception.message) as unknown;
    } catch (err) {
      message = exception.message;
    }
    // exception.status
    return {
      name: exception.name,
      message: message,
      type: type,
      status: exception.status,
      timestamp: new Date().toISOString(),
      stack: this.getStack(exception.stack),
    };
  }

  private parseErrorException(exception: Error, type: ExceptionTypeEnum): ExceptionInterface {
    return {
      name: exception.name,
      message: exception.message,
      type: type,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      stack: this.getStack(exception.stack),
    };
  }

  private parseUnknownException(exception: unknown, type: ExceptionTypeEnum): ExceptionInterface {
    return {
      name: ExceptionService.name,
      message: exception,
      type: type,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      stack: this.getStack(new Error().stack),
    };
  }
}
