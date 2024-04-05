import 'reflect-metadata';

type PropertyKeyType = string | symbol | undefined;
type MetadataMapValueType = {
  callback: string;
  args: unknown[];
};
type MetadataMapType = Map<number, MetadataMapValueType[]>;

/**
 * @deprecated
 */
class DecoratorSingleton {
  private static self: DecoratorSingleton;

  private readonly metadataKey = Symbol(DecoratorSingleton.name);
  private readonly decoratorList: {
    [key: string]: CallableFunction;
  } = {};

  public static getInstance(): DecoratorSingleton {
    if (!DecoratorSingleton.self) {
      DecoratorSingleton.self = new DecoratorSingleton();
    }
    return DecoratorSingleton.self;
  }

  public decorateMethod(): MethodDecorator {
    return function (target, propertyKey, descriptor: PropertyDescriptor): PropertyDescriptor {
      const metadata = DecoratorSingleton.self.getMetadata(target, propertyKey);
      return {
        get() {
          return (...args: unknown[]) => {
            return (descriptor.value as (...args: unknown[]) => unknown).apply(
              this,
              args.map(function (value, key) {
                return metadata.has(key)
                  ? DecoratorSingleton.self.applyCallback(metadata.get(key) || [], value)
                  : value;
              }),
            );
          };
        },
      };
    };
  }

  public decorateParam(index: string, callback: CallableFunction, ...args: unknown[]): ParameterDecorator {
    return function (target, propertyKey, parameterIndex): void {
      if (!DecoratorSingleton.self.getCallback(index)) {
        DecoratorSingleton.self.setCallback(index, callback);
      }
      (function (target, propertyKey, parameterIndex): void {
        // process.stdout.write(`${index}->${String(propertyKey)}[${parameterIndex}]`);
        const metadataMap = DecoratorSingleton.self.getMetadata(target, propertyKey);
        const metadata = (metadataMap.get(parameterIndex) || []).concat({
          args,
          callback: index,
        });
        metadataMap.set(parameterIndex, metadata);
        DecoratorSingleton.self.setMetadata(target, propertyKey, metadataMap);
      })(target, propertyKey, parameterIndex);
    };
  }

  private getMetadata(target: object, propertyKey: PropertyKeyType): MetadataMapType {
    if (!propertyKey) {
      throw new Error('propertyKey is required');
    }
    return (Reflect.getOwnMetadata(this.metadataKey, target, propertyKey) || new Map()) as MetadataMapType;
  }

  private setMetadata(target: object, propertyKey: PropertyKeyType, metadata: MetadataMapType): void {
    if (!propertyKey) {
      throw new Error('propertyKey is required');
    }
    Reflect.defineMetadata(this.metadataKey, metadata, target, propertyKey);
  }

  private setCallback(index: string, callback: CallableFunction): void {
    this.decoratorList[index] = callback;
  }

  private getCallback(index: string): CallableFunction {
    return this.decoratorList[index];
  }

  private applyCallback(metadata: MetadataMapValueType[], propertyValue: unknown): unknown {
    /** handle multiple decorators */
    return [...metadata].reverse().reduce(function (prev, curr) {
      return DecoratorSingleton.self.getCallback(curr.callback)(prev, ...curr.args);
    }, propertyValue);
  }
}

/**
 * @deprecated
 */
export const Decorator = DecoratorSingleton.getInstance();
