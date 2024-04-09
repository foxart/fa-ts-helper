import 'reflect-metadata';
import { DataHelper } from './data.helper';

type FunctionType = (...args: unknown[]) => unknown;
type ConstructableType = new (...args: unknown[]) => unknown;

interface DesignMetadataInterface {
  type: ConstructableType;
  paramtypes: ConstructableType[];
  returntype: ConstructableType;
}

type ClassMetadataType = unknown;
type ClassCallbackType = <T extends FunctionType>(target: object) => T | void;
type MethodMetadataType = unknown;
type MethodCallbackType = <T>(
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => T | void;
type ParameterMetadataType = Map<
  number,
  {
    callback?: ParameterCallbackType | null;
    constructor: ConstructableType;
    data: unknown;
  }[]
>;
type ParameterCallbackType = (
  value: unknown,
  metadata: {
    classData: unknown;
    methodData: unknown;
    parameterConstructor: ConstructableType;
    parameterData: unknown;
  },
) => unknown;

export class DecoratorHelper {
  public readonly symbol: symbol;

  public constructor(symbol: string) {
    this.symbol = Symbol(symbol);
  }

  private static fromToProperty(from: FunctionType, to: FunctionType, propertyKey: string | symbol): void {
    Object.getOwnPropertyNames(from).forEach((property) => {
      Object.defineProperty(to, property, { value: propertyKey });
    });
  }

  private static getDesignMetadata(target: object, propertyKey: string | symbol): DesignMetadataInterface {
    return {
      type: Reflect.getOwnMetadata('design:type', target, propertyKey) as ConstructableType,
      paramtypes: Reflect.getOwnMetadata('design:paramtypes', target, propertyKey) as ConstructableType[],
      returntype: Reflect.getOwnMetadata('design:returntype', target, propertyKey) as ConstructableType,
    };
  }

  public static getClassMetadata(symbol: symbol, target: object): ClassMetadataType {
    return Reflect.getOwnMetadata(symbol, target.constructor) as ClassMetadataType;
  }

  private static setClassMetadata(symbol: symbol, metadata: ClassMetadataType, target: object): void {
    Reflect.defineMetadata(symbol, metadata, target);
  }

  private static getMethodMetadata(symbol: symbol, target: object, propertyKey: string | symbol): MethodMetadataType {
    return Reflect.getOwnMetadata(symbol, target.constructor, propertyKey) as MethodMetadataType;
  }

  private static setMethodMetadata(
    symbol: symbol,
    metadata: MethodMetadataType,
    target: object,
    propertyKey: string | symbol,
  ): void {
    Reflect.defineMetadata(symbol, metadata, target.constructor, propertyKey);
  }

  private static getParameterMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol,
  ): ParameterMetadataType {
    return (Reflect.getOwnMetadata(symbol, target, propertyKey) || new Map()) as ParameterMetadataType;
  }

  private static setParameterMetadata(
    symbol: symbol,
    metadata: ParameterMetadataType,
    target: object,
    propertyKey: string | symbol,
  ): void {
    Reflect.defineMetadata(symbol, metadata, target, propertyKey);
  }

  private static decorateArguments(
    args: unknown[],
    symbol: symbol,
    target: ConstructableType,
    propertyKey: string | symbol,
    // callback?: MethodCallbackType | null,
    // data?: unknown,
  ): unknown[] {
    const classMetadata = DecoratorHelper.getClassMetadata(symbol, target);
    const methodMetadata = DecoratorHelper.getMethodMetadata(symbol, target, propertyKey);
    const parameterMetadata = DecoratorHelper.getParameterMetadata(symbol, target, propertyKey);
    // return (
    //   callback
    //     ? args.map((arg) => {
    //         return callback(arg, data);
    //       })
    //     : args
    // )
    return args.map((value, index) => {
      const item = parameterMetadata.get(index);
      return !item
        ? value
        : item.reverse().reduce((acc, { callback, constructor, data }) => {
            return callback
              ? callback(acc, {
                  classData: classMetadata,
                  methodData: methodMetadata,
                  parameterConstructor: constructor,
                  parameterData: data,
                })
              : acc;
          }, value);
    });
  }

  public decorateClass(metadata?: unknown, callback?: ClassCallbackType): ClassDecorator {
    return <T>(target: object): T | void => {
      DecoratorHelper.setClassMetadata(this.symbol, metadata, target);
      if (callback) {
        const result = callback(target) as T;
        // console.error({ result });
        return result;
      }
    };
  }

  public decorateMethod(metadata?: unknown, callback?: MethodCallbackType): MethodDecorator {
    //todo make before/after callbacks to transform req/res
    return <T>(target: ConstructableType, propertyKey: string | symbol, descriptor: PropertyDescriptor): T | void => {
      DecoratorHelper.setMethodMetadata(this.symbol, metadata, target, propertyKey);
      /**/
      const symbol = this.symbol;
      const originalDescriptorValue = descriptor.value as FunctionType;
      let result: unknown[];
      if (callback) {
        result = callback(target, propertyKey, descriptor) as unknown[];
      }
      descriptor.value = function (...args: unknown[]): FunctionType {
        return originalDescriptorValue.apply(
          this,
          DecoratorHelper.decorateArguments(result ? result : args, symbol, target, propertyKey),
        ) as FunctionType;
      };
      DecoratorHelper.fromToProperty(originalDescriptorValue, descriptor.value as FunctionType, propertyKey);
    };
  }

  public decorateParameter(callback?: ParameterCallbackType | null, data?: unknown): ParameterDecorator {
    return (target: object, propertyKey: string | symbol, parameterIndex: number): void => {
      const typeMetadata = DecoratorHelper.getDesignMetadata(target, propertyKey);
      const metadata = DecoratorHelper.getParameterMetadata(this.symbol, target, propertyKey);
      metadata.set(parameterIndex, [
        ...(metadata.get(parameterIndex) || []),
        {
          constructor: typeMetadata.paramtypes[parameterIndex],
          data,
          callback,
        },
      ]);
      DecoratorHelper.setParameterMetadata(this.symbol, metadata, target, propertyKey);
    };
  }
}
