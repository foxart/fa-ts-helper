import 'reflect-metadata';
import { ClassConstructor } from 'class-transformer';

type ConstructorType<T> = {
  new (...args: unknown[]): T;
};

interface MetadataInterface {
  classConstructor: ConstructorType<unknown>;
  classData: unknown;
  paramConstructor: ConstructorType<unknown>;
  paramType: string;
}

type CallbackType = (value: unknown, metadata: MetadataInterface) => unknown;
// type CallbackType = (value: unknown, constructor: ConstructorType<unknown>, type: string) => unknown;
type ParamMetadataInterface = {
  callback: CallbackType;
  paramConstructor: ConstructorType<unknown>;
  paramType: string;
};
type MetadataMapType = Map<number, ParamMetadataInterface[]>;

export class DecoratorHelper {
  public readonly symbol: symbol;

  public constructor(symbol: string) {
    this.symbol = Symbol(symbol);
  }

  public getPropertyMetadata(target: object, propertyKey: string | symbol): MetadataMapType {
    return (Reflect.getOwnMetadata(this.symbol, target, propertyKey) || new Map()) as MetadataMapType;
  }

  public setPropertyMetadata(target: object, propertyKey: string | symbol, metadata: MetadataMapType): void {
    Reflect.defineMetadata(this.symbol, metadata, target, propertyKey);
  }

  public getParameterType(
    target: object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): ConstructorType<unknown> {
    const paramTypeList = Reflect.getMetadata('design:paramtypes', target, propertyKey) as ConstructorType<unknown>[];
    return paramTypeList[parameterIndex];
  }

  public decorateClass(value: unknown): ClassDecorator {
    return Reflect.metadata(this.symbol, value);
  }
  public decorateMethod(): MethodDecorator {
    return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
      const symbol = this.symbol;
      const paramMetadata = this.getPropertyMetadata(target, propertyKey);
      const original = descriptor.value as CallbackType;
      descriptor.value = function (...args: unknown[]): unknown {
        paramMetadata.forEach((item, index) => {
          args[index] = item.reverse().reduce((acc, { callback, paramConstructor, paramType }) => {
            return callback(acc, {
              classConstructor: target.constructor as ClassConstructor<unknown>,
              classData: Reflect.getMetadata(symbol, target.constructor),
              paramConstructor,
              paramType,
            });
          }, args[index]);
        });
        return original.apply(this, args);
      };
      // console.log(target.constructor);
      Object.getOwnPropertyNames(original).forEach((property) => {
        Object.defineProperty(descriptor.value, property, { value: propertyKey });
      });
    };
  }

  public decorateParameter(callback: CallbackType): ParameterDecorator {
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
      // console.info(target.constructor);
    };
  }
}
