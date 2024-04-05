import 'reflect-metadata';

declare type ConstructorType<T> = {
  new (...args: unknown[]): T;
};
type CallbackType = (data: unknown, constructor: ConstructorType<unknown>, type: string) => unknown;
type MetadataInterface = {
  callback: CallbackType;
  constructor: ConstructorType<unknown>;
  type: string;
};
type MetadataMapType = Map<number, MetadataInterface[]>;

export class DecoratorHelper {
  protected readonly symbol: symbol;

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

  public decorateMethod(): MethodDecorator {
    return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
      const metadata = this.getPropertyMetadata(target, propertyKey);
      const original = descriptor.value as CallbackType;
      descriptor.value = function (...args: unknown[]): unknown {
        metadata.forEach((item, index) => {
          args[index] = item.reverse().reduce((acc, { callback, constructor, type }) => {
            return callback(acc, constructor, type);
          }, args[index]);
        });
        return original.apply(this, args);
      };
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
          constructor: paramType,
          type: paramType.name,
        },
      ]);
      this.setPropertyMetadata(target, propertyKey, metadata);
    };
  }
}
