import { ClassConstructor } from 'class-transformer';
import { HttpStatus } from '@nestjs/common';
import { DataHelper } from '../helpers/data.helper';
import { ErrorService } from './error.service';
import { validate, validateSync, ValidationError, ValidatorOptions } from 'class-validator';

type ErrorType = Record<string, unknown>;

export class ValidatorService {
  public constructor(private readonly config: ValidatorOptions = {}) {}

  public getConfig(): ValidatorOptions {
    return this.config;
  }

  public async errorsAsync<I>(instance: I): Promise<ErrorType | null> {
    return this.getError(await validate(instance as object, this.config));
  }

  public errorsSync<I>(instance: I): ErrorType | null {
    return this.getError(validateSync(instance as object, this.config));
  }

  public async validateAsync<I>(instance: I): Promise<I> {
    const error = this.getError(await validate(instance as object, this.config));
    if (error) {
      this.throwError(instance, error);
    }
    return instance;
  }

  public validateSync<T>(instance: T): T {
    const error = this.getError(validateSync(instance as object, this.config));
    if (error) {
      this.throwError(instance, error);
    }
    return instance;
  }

  private getError(validationErrorList: ValidationError[]): ErrorType | null {
    // todo: check if acc is array not record
    const result = validationErrorList.reduce((acc: ErrorType, error) => {
      if (error.children?.length) {
        acc[error.property] = this.getError(error.children);
      } else {
        if (!acc[error.property]) {
          acc[error.property] = [];
        }
        (acc[error.property] as string[]).push(
          ...Object.entries(error.constraints as object).reduce((acc: string[], [, value]) => {
            acc.push(value as string);
            return acc;
          }, []),
        );
      }
      return acc;
    }, {});
    return DataHelper.isEmptyObject(result) ? null : result;
  }

  private throwError<T>(instance: T, errors: ErrorType | null): void {
    throw new ErrorService({
      name: (instance as ClassConstructor<T>).constructor.name,
      message: errors,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
