import { DataHelper } from './data.helper';

class ConverterSingleton {
  private static self: ConverterSingleton;

  public static getInstance(): ConverterSingleton {
    if (!ConverterSingleton.self) {
      ConverterSingleton.self = new ConverterSingleton();
    }
    return ConverterSingleton.self;
  }

  public mapObjectKeyValue<Type>(
    callback: (key: keyof Type, value: unknown) => [string, unknown],
    obj: Type,
    recursive?: boolean,
  ): Type {
    return Object.fromEntries(
      Object.entries(obj as Record<keyof Type, unknown>).map(([key, value]) => {
        const [newKey, newValue] = callback(key as keyof Type, value);
        return [
          newKey,
          recursive && DataHelper.isObject(newValue)
            ? this.mapObjectKeyValue(callback, newValue as Type, recursive)
            : newValue,
        ];
      }),
    ) as Type;
  }

  // public dateToSting(date: Date): string {
  //   return date.toISOString().replace(/T/, ' ').replace(/Z/, '');
  // }
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

  public dataToJson(data: unknown, indent?: number): string {
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
}

export const ConverterHelper = ConverterSingleton.getInstance();
