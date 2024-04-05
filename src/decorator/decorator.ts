import 'reflect-metadata';

type PropertyKeyType = string | symbol | undefined;
type MetadataMapValueType = {
  name: string;
  args: unknown[];
};
export type MetadataMapType = Map<number, MetadataMapValueType[]>;

class DecoratorSingleton {
  private static self: DecoratorSingleton;

  protected readonly metadataKey: symbol;

  protected readonly callbackList: { [key: string]: CallableFunction };

  public constructor() {
    this.metadataKey = Symbol('__FA_DECORATOR__');
    this.callbackList = {};
  }

  public static getInstance(): DecoratorSingleton {
    if (!DecoratorSingleton.self) {
      DecoratorSingleton.self = new DecoratorSingleton();
    }
    return DecoratorSingleton.self;
  }

  public setCallback(index: string, callback: CallableFunction): void {
    this.callbackList[index] = callback;
  }

  public getCallback(index: string): CallableFunction {
    return this.callbackList[index];
  }

  public getMetadata(target: object, propertyKey: PropertyKeyType): MetadataMapType {
    if (!propertyKey) {
      throw new Error('propertyKey is required');
    }
    return (Reflect.getOwnMetadata(this.metadataKey, target, propertyKey) || new Map()) as MetadataMapType;
  }

  public setMetadata(target: object, propertyKey: PropertyKeyType, metadata: MetadataMapType): void {
    if (!propertyKey) {
      throw new Error('propertyKey is required');
    }
    Reflect.defineMetadata(this.metadataKey, metadata, target, propertyKey);
  }
}

export const DecoratorNew = DecoratorSingleton.getInstance();
