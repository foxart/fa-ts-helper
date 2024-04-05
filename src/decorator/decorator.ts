type CallbackType = (...args: unknown[]) => unknown;
type MetadataType = {
  callback: CallbackType;
  type: unknown;
};
type MetadataMapType = Map<number, MetadataType[]>;
export type DecoratorPayloadType = {
  data: unknown;
  type: { new (...args: unknown[]): unknown };
};

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

  public getParameterType(target: object, propertyKey: string | symbol, parameterIndex: number): CallbackType {
    const paramTypeList = Reflect.getMetadata('design:paramtypes', target, propertyKey) as CallbackType[];
    return paramTypeList[parameterIndex];
  }

  public decorateMethod(): MethodDecorator {
    return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
      const metadata = this.getPropertyMetadata(target, propertyKey);
      const original = descriptor.value as CallbackType;
      descriptor.value = function (...args: unknown[]): unknown {
        metadata.forEach((item, index) => {
          args[index] = item.reverse().reduce((acc, { callback, type }) => {
            return callback({ data: acc, type });
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
      metadata.set(parameterIndex, [...(metadata.get(parameterIndex) || []), { callback, type: paramType }]);
      this.setPropertyMetadata(target, propertyKey, metadata);
    };
  }
}
