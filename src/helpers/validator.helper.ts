import { validate, validateSync, ValidationError, ValidatorOptions } from 'class-validator';

class ValidatorSingleton {
  private static self: ValidatorSingleton;

  public static getInstance(): ValidatorSingleton {
    if (!ValidatorSingleton.self) {
      ValidatorSingleton.self = new ValidatorSingleton();
    }
    return ValidatorSingleton.self;
  }

  public async validateAsync<T>(
    object: T | string,
    options?: ValidatorOptions,
  ): Promise<Record<string, unknown> | null> {
    const result = this.getValidationErrorList(await validate(object as object, options));
    return this.isObjectEmpty(result) ? null : result;
  }

  public validateSync<T>(object: T | string, options?: ValidatorOptions): Record<string, unknown> | null {
    const result = this.getValidationErrorList(validateSync(object as object, options));
    return this.isObjectEmpty(result) ? null : result;
  }

  private getValidationErrorList(data: ValidationError[]): Record<string, unknown> {
    return data.reduce((prev: Record<string, unknown>, error) => {
      if (error.children?.length) {
        prev[error.property] = this.getValidationErrorList(error.children);
      } else {
        if (!prev[error.property]) {
          prev[error.property] = [];
        }
        (prev[error.property] as string[]).push(
          ...Object.entries(error.constraints as object).reduce((acc: string[], [, value]) => {
            acc.push(value as string);
            return acc;
          }, []),
        );
      }
      return prev;
    }, {});
  }

  private isObjectEmpty(object: object): boolean {
    return object && Object.keys(object).length === 0 && object.constructor === Object;
  }
}

export const ValidatorHelper = ValidatorSingleton.getInstance();
