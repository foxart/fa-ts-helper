import 'reflect-metadata';
import { ConsoleHelper } from './console.helper';

const Console = new ConsoleHelper({ info: false, link: false });
type FunctionType = (...args: unknown[]) => unknown;

interface DesignMetadataInterface {
  type: FunctionType;
  paramtypes: FunctionType[];
  returntype: FunctionType;
}

type ClassMetadataType = unknown;
type ClassCallbackType = (...args: unknown[]) => unknown;
type MethodMetadataType = unknown;
type MethodCallbackType = (...args: unknown[]) => unknown;
type ParameterMetadataType = Map<
  number,
  {
    parameterCallback?: ParameterCallbackType | null;
    parameterConstructor: FunctionType;
    parameterData: unknown;
  }[]
>;
type ParameterCallbackType = (
  value: unknown,
  metadata: {
    class: { data: unknown };
    method: { data: unknown };
    parameter: { constructor: FunctionType; data: unknown };
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

  private static getDesignMetadata(target: FunctionType, propertyKey: string | symbol): DesignMetadataInterface {
    return {
      type: Reflect.getOwnMetadata('design:type', target, propertyKey) as FunctionType,
      paramtypes: Reflect.getOwnMetadata('design:paramtypes', target, propertyKey) as FunctionType[],
      returntype: Reflect.getOwnMetadata('design:returntype', target, propertyKey) as FunctionType,
    };
  }

  private static getClassMetadata(symbol: symbol, target: object): ClassMetadataType {
    return Reflect.getOwnMetadata(symbol, target) as ClassMetadataType;
  }

  private static setClassMetadata(symbol: symbol, metadata: ClassMetadataType, target: object): void {
    Reflect.defineMetadata(symbol, metadata, target);
  }

  private static getMethodMetadata(symbol: symbol, target: object, propertyKey: string | symbol): MethodMetadataType {
    return Reflect.getOwnMetadata(symbol, target, propertyKey) as ClassMetadataType;
  }

  private static setMethodMetadata(
    symbol: symbol,
    metadata: MethodMetadataType,
    target: object,
    propertyKey: string | symbol,
  ): void {
    Reflect.defineMetadata(symbol, metadata, target, propertyKey);
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

  private descriptorValue(
    descriptor: FunctionType,
    symbol: symbol,
    target: object,
    propertyKey: string | symbol,
    callback?: MethodCallbackType | null,
  ): FunctionType {
    return function (...args: unknown[]): FunctionType {
      const classMetadata = DecoratorHelper.getClassMetadata(symbol, target.constructor);
      const methodMetadata = DecoratorHelper.getMethodMetadata(symbol, target.constructor, propertyKey);
      const parameterMetadata = DecoratorHelper.getParameterMetadata(symbol, target, propertyKey);
      const decoratedArgs = (
        callback
          ? args.map((arg) => {
              return callback(arg);
            })
          : args
      ).map((arg, index) => {
        const item = parameterMetadata.get(index);
        return !item
          ? arg
          : item.reverse().reduce((acc, { parameterCallback, parameterConstructor, parameterData }) => {
              return parameterCallback
                ? parameterCallback(acc, {
                    class: { data: classMetadata },
                    method: { data: methodMetadata },
                    parameter: { constructor: parameterConstructor, data: parameterData },
                  })
                : acc;
            }, arg);
      });
      // @ts-ignore
      return descriptor.apply(this as FunctionType, decoratedArgs) as FunctionType;
    };
  }

  public decorateClass(callback?: ClassCallbackType | null, data?: unknown): ClassDecorator {
    return (target): void => {
      DecoratorHelper.setClassMetadata(this.symbol, callback ? callback(data) : data, target);
    };
  }

  public decorateMethod(callback?: MethodCallbackType | null, data?: unknown): MethodDecorator {
    return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
      DecoratorHelper.setMethodMetadata(this.symbol, data, target.constructor, propertyKey);
      /**/
      const symbol = this.symbol;
      const parameterCallback = descriptor.value as FunctionType;
      // descriptor.value = function (...args: unknown[]): FunctionType {
      //   const classMetadata = DecoratorHelper.getClassMetadata(symbol, target.constructor);
      //   const methodMetadata = DecoratorHelper.getMethodMetadata(symbol, target.constructor, propertyKey);
      //   const parameterMetadata = DecoratorHelper.getParameterMetadata(symbol, target, propertyKey);
      //   const decoratedArgs = (
      //     callback
      //       ? args.map((arg) => {
      //           return callback(arg);
      //         })
      //       : args
      //   ).map((arg, index) => {
      //     const item = parameterMetadata.get(index);
      //     return !item
      //       ? arg
      //       : item.reverse().reduce((acc, { parameterCallback, parameterConstructor, parameterData }) => {
      //           return parameterCallback
      //             ? parameterCallback(acc, {
      //                 class: { data: classMetadata },
      //                 method: { data: methodMetadata },
      //                 parameter: { constructor: parameterConstructor, data: parameterData },
      //               })
      //             : acc;
      //         }, arg);
      //   });
      //   return parameterCallback.apply(this, decoratedArgs) as FunctionType;
      // };
      descriptor.value = this.descriptorValue(parameterCallback, symbol, target, propertyKey, callback);
      DecoratorHelper.fromToProperty(parameterCallback, descriptor.value as FunctionType, propertyKey);
    };
  }

  public decorateParameter(callback?: ParameterCallbackType | null, data?: unknown): ParameterDecorator {
    return (target: FunctionType, propertyKey: string | symbol, parameterIndex: number): void => {
      const typeMetadata = DecoratorHelper.getDesignMetadata(target, propertyKey);
      const metadata = DecoratorHelper.getParameterMetadata(this.symbol, target, propertyKey);
      metadata.set(parameterIndex, [
        ...(metadata.get(parameterIndex) || []),
        {
          parameterCallback: callback,
          parameterData: data,
          parameterConstructor: typeMetadata.paramtypes[parameterIndex],
        },
      ]);
      DecoratorHelper.setParameterMetadata(this.symbol, metadata, target, propertyKey);
    };
  }
}
