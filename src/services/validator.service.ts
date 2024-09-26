import { ClassConstructor } from 'class-transformer';
import { HttpStatus } from '@nestjs/common';
import { ErrorService } from './error.service';
import { validate, validateSync, ValidationError, ValidatorOptions } from 'class-validator';

interface ErrorInterface {
  property?: string;
  value?: unknown;
  constraints?: Record<string, string>[];
}

export class ValidatorService {
  public constructor(private readonly config: ValidatorOptions = {}) {}

  public getConfig(): ValidatorOptions {
    return this.config;
  }

  public async errorsAsync<I>(instance: I): Promise<ErrorInterface[] | null> {
    return this.getError(await validate(instance as object, this.config));
  }

  public errorsSync<I>(instance: I): ErrorInterface[] | null {
    return this.getError(validateSync(instance as object, this.config));
  }

  public async validateAsync<I>(instance: I): Promise<I> {
    const errors = this.getError(await validate(instance as object, this.config));
    if (errors) {
      this.throwErrors(instance, errors);
    }
    return instance;
  }

  public validateSync<T>(instance: T): T {
    const errors = this.getError(validateSync(instance as object, this.config));
    if (errors) {
      this.throwErrors(instance, errors);
    }
    return instance;
  }

  private getError(errorList: ValidationError[]): ErrorInterface[] | null {
    const result: ErrorInterface[] = [];
    const mapConstraints = (constraints: Record<string, string>): Array<Record<string, string>> => {
      return Object.entries(constraints).map(([key, value]) => ({ [key]: value }));
    };
    const processError = (error: ValidationError, propertyPath: string = ''): void => {
      const currentProperty = propertyPath ? `${propertyPath}.${error.property}` : error.property;
      if (error.children && error.children.length > 0) {
        error.children.forEach((child) => {
          processError(child, currentProperty);
        });
      } else if (error.constraints) {
        result.push({
          property: currentProperty,
          value: error.value,
          constraints: mapConstraints(error.constraints as Record<string, string>),
        });
      }
    };
    errorList.forEach((error) => processError(error));
    return result.length ? result : null;
  }

  // private getError(errorList: ValidationError[]): Record<string, unknown> | null {
  //   const result = errorList.reduce((acc: ErrorType, validationError) => {
  //     if (validationError.children?.length) {
  //       acc[validationError.property] = this.getError(validationError.children);
  //     } else {
  //       if (!acc[validationError.property]) {
  //         acc[validationError.property] = [];
  //       }
  //       (acc[validationError.property] as string[]).push(
  //         ...Object.entries(validationError.constraints as object).reduce((acc: string[], [, value]) => {
  //           acc.push(value as string);
  //           return acc;
  //         }, []),
  //       );
  //     }
  //     return acc;
  //   }, {});
  //   return DataHelper.isEmptyObject(result) ? null : result;
  // }
  private throwErrors<T>(instance: T, errors: ErrorInterface[] | null): void {
    throw new ErrorService({
      name: (instance as ClassConstructor<T>).constructor.name,
      message: errors,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
