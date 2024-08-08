import { validate, validateSync, ValidationError, ValidatorOptions } from 'class-validator';

interface FilterOptionsInterface {
  undefined?: boolean;
  nullValue?: boolean;
  emptyArray?: boolean;
  emptyObject?: boolean;
  emptyString?: boolean;
  zeroNumber?: boolean;
  exclude?: string[];
  recursive?: boolean;
}

class DataSingleton {
  private static self: DataSingleton;
  private readonly characters: string;

  private constructor() {
    const upper = Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 65)).join('');
    const lower = Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 97)).join('');
    const numbers = Array.from({ length: 10 }, (_, i) => i).join('');
    this.characters = [upper, lower, numbers].join('');
  }

  public static getInstance(): DataSingleton {
    if (!DataSingleton.self) {
      DataSingleton.self = new DataSingleton();
    }
    return DataSingleton.self;
  }

  public filter<Data, Type>(data: Data, options: FilterOptionsInterface & { only?: Type[] }): Data {
    const isEmpty = (data: unknown, options?: FilterOptionsInterface & { only?: Type[] }): boolean => {
      // options?.only;
      if (options?.undefined && data === undefined) {
        return true;
      } else if (options?.nullValue && data === null) {
        return true;
      } else if (options?.emptyString && data === '') {
        return true;
      } else if (options?.zeroNumber && data === 0) {
        return true;
      } else if (options?.emptyObject && this.isObject(data)) {
        return this.isEmptyObject(data);
      } else if (options?.emptyArray && Array.isArray(data)) {
        return data.length === 0;
      }
      return false;
    };
    /**
     *
     */
    if (Array.isArray(data)) {
      return data
        .map((item: Data) => {
          return this.filter(item, options);
        })
        .filter((item) => {
          return !isEmpty(item, { ...options, nullValue: false, zeroNumber: false, emptyString: false });
        }) as Data;
    } else if (this.isObject(data)) {
      return Object.entries(data as Record<string, unknown>).reduce((acc, [key, value]) => {
        if (options.exclude?.includes(key)) {
          return acc;
        } else if (this.isObject(value)) {
          const result = options.recursive ? this.filter(value, options) : value;
          if (options.only && !options.only.includes(key as Type)) {
            return { ...acc, [key]: result };
          }
          return isEmpty(result, options) ? acc : { ...acc, [key]: result };
        } else {
          if (options.only && !options.only.includes(key as Type)) {
            return { ...acc, [key]: value };
          }
          return isEmpty(value, options) ? acc : { ...acc, [key]: value };
        }
      }, {} as Data);
    } else {
      return data;
    }
  }

  public randomFloat(min: number, max: number): number {
    return Math.random() * (max - min + 1) + min;
  }

  public randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public randomString(length: number): string {
    let counter = 0;
    let result = '';
    while (counter < length) {
      result += this.characters.charAt(Math.floor(Math.random() * this.characters.length));
      counter++;
    }
    return result;
  }

  public dateToSting(date: Date): string {
    return date.toISOString().replace(/T/, ' ').replace(/Z/, '');
  }

  public upperToSeparator(string: string, separator: string): string {
    const result = string.match(/(^[a-z]+|[A-Z][a-z]*)/g);
    return result ? result?.join(separator) : string;
  }

  public separatorToCamel(string: string, separator: string): string {
    return string
      .toLowerCase()
      .split(separator)
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  }

  public separatorToPascal(string: string, separator: string): string {
    return string
      .toLowerCase()
      .split(separator)
      .map((word, index) => {
        return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  }

  public jsonStringify(data: unknown, indent?: number): string {
    const cache: unknown[] = [];
    return JSON.stringify(
      data,
      (_key, value: unknown) =>
        typeof value === 'object' && value !== null
          ? cache.includes(value)
            ? undefined
            : cache.push(value) && value
          : value,
      indent ?? 2,
    );
  }

  public async validateAsync<T>(object: T, options?: ValidatorOptions): Promise<Record<string, unknown> | null> {
    const result = this.validationErrorList(await validate(object as object, options));
    return this.isEmptyObject(result) ? null : result;
  }

  public validateSync<T>(object: T, options?: ValidatorOptions): Record<string, unknown> | null {
    const result = this.validationErrorList(validateSync(object as object, options));
    return this.isEmptyObject(result) ? null : result;
  }

  public isEmptyObject(object: unknown): boolean {
    return object instanceof Object && Object.keys(object).length === 0;
  }

  public isPlainObject(object: unknown): boolean {
    return object instanceof Object && object.constructor === Object;
  }

  public isObject(data: unknown): boolean {
    if (data instanceof Date) {
      return false;
    } else if (data instanceof RegExp) {
      return false;
    } else if (data instanceof Object) {
      /** Check for mongoId instance */
      return !data.toString().match(/^[0-9a-fA-F]{24}$/);
    } else {
      return data instanceof Object;
    }
  }

  private validationErrorList(data: ValidationError[]): Record<string, unknown> {
    // todo prev could be array not record
    return data.reduce((prev: Record<string, unknown>, error) => {
      if (error.children?.length) {
        prev[error.property] = this.validationErrorList(error.children);
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
}

export const DataHelper = DataSingleton.getInstance();
