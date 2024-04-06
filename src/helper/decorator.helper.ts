import 'reflect-metadata';
import { ClassConstructor } from 'class-transformer';

type ConstructorType<T> = {
  new (...args: unknown[]): T;
};

interface ParameterCallbackMetadataInterface {
  classConstructor: ConstructorType<unknown>;
  classData: unknown;
  paramConstructor: ConstructorType<unknown>;
  paramType: string;
}

type MethodCallbackType = (...value: unknown[]) => unknown[];
type ParameterCallbackType = (value: unknown, metadata: ParameterCallbackMetadataInterface) => unknown;
type ParameterMetadataInterface = {
  callback: ParameterCallbackType;
  paramConstructor: ConstructorType<unknown>;
  paramType: string;
};
type ParameterMetadataMapType = Map<number, ParameterMetadataInterface[]>;

export class DecoratorHelper {
  public readonly symbol: symbol;

  public constructor(symbol: string) {
    this.symbol = Symbol(symbol);
  }

  public decorateClass(value: unknown): ClassDecorator {
    return Reflect.metadata(this.symbol, value);
  }

  public decorateParameter(callback: ParameterCallbackType): ParameterDecorator {
    return (target: object, propertyKey: string | symbol, parameterIndex: number): void => {
      const paramType = this.getParameterType(target, propertyKey, parameterIndex);
      const metadata = this.getPropertyMetadata(target, propertyKey);
      metadata.set(parameterIndex, [
        ...(metadata.get(parameterIndex) || []),
        {
          callback,
          paramConstructor: paramType,
          paramType: paramType.name,
        },
      ]);
      this.setPropertyMetadata(target, propertyKey, metadata);
    };
  }

  public decorateMethod(callback?: MethodCallbackType): MethodDecorator {
    return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
      const symbol = this.symbol;
      const paramMetadata = this.getPropertyMetadata(target, propertyKey);
      const originalDescriptor = descriptor.value as ParameterCallbackType;
      descriptor.value = function (...args: unknown[]) {
        if (callback) {
          const callbackResult = callback(...args);
          console.warn({ callbackResult });
        }
        const decorated = DecoratorHelper.applyParameterDecorator(symbol, target, paramMetadata, args);
        console.warn({ args, decorated });
        return originalDescriptor.apply(this, decorated);
      };
      DecoratorHelper.copyParameterProperties(originalDescriptor, descriptor.value, propertyKey);
    };
  }

  private static applyParameterDecorator(
    symbol: symbol,
    target: object,
    paramMetadata: ParameterMetadataMapType,
    args: unknown[],
  ): unknown[] {
    return args.map((arg, index) => {
      const item = paramMetadata.get(index);
      return !item
        ? arg
        : item.reverse().reduce((acc, { callback, paramConstructor, paramType }) => {
            return callback(acc, {
              classConstructor: target.constructor as ClassConstructor<unknown>,
              classData: Reflect.getMetadata(symbol, target.constructor),
              paramConstructor,
              paramType,
            });
          }, arg);
    });
  }

  private static copyParameterProperties(
    from: ParameterCallbackType,
    to: ParameterCallbackType,
    propertyKey: string | symbol,
  ): void {
    Object.getOwnPropertyNames(from).forEach((property) => {
      Object.defineProperty(to, property, { value: propertyKey });
    });
  }

  private getPropertyMetadata(target: object, propertyKey: string | symbol): ParameterMetadataMapType {
    return (Reflect.getOwnMetadata(this.symbol, target, propertyKey) || new Map()) as ParameterMetadataMapType;
  }

  private setPropertyMetadata(target: object, propertyKey: string | symbol, metadata: ParameterMetadataMapType): void {
    Reflect.defineMetadata(this.symbol, metadata, target, propertyKey);
  }

  private getParameterType(
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): ConstructorType<unknown> {
    const paramTypeList = Reflect.getMetadata('design:paramtypes', target, propertyKey);
    return paramTypeList[parameterIndex];
  }
}
