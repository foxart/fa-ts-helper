import 'reflect-metadata';

type FunctionType = (...args: unknown[]) => unknown;
type ConstructableType = new (...args: unknown[]) => unknown;

interface DesignMetadataInterface {
  type: ConstructableType;
  paramtypes: ConstructableType[];
  returntype: ConstructableType;
}

/**
 *
 */
type ClassMetadataGetType = {
  type: object;
  data: unknown;
};
type ClassMetadataSetType = {
  data?: unknown;
};
type ClassCallbackType = <T extends FunctionType>(target: object) => T | void;
/**
 *
 */
type MethodMetadataGetType = {
  type: ConstructableType;
  data: unknown;
  before?: MethodMetadataCallbackType;
  after?: MethodMetadataCallbackType;
};
type MethodMetadataSetType = {
  data?: unknown;
  before?: MethodMetadataCallbackType;
  after?: MethodMetadataCallbackType;
};
type MethodCallbackType = (
  target: object,
  propertyKey: string | symbol,
  // descriptor: TypedPropertyDescriptor<T>,
  // ...args: unknown[]
) => unknown | void;
type MethodMetadataCallbackType = (
  metadata: {
    classType: object | undefined;
    classData: unknown | undefined;
    methodType: ConstructableType | undefined;
    methodData: unknown | undefined;
  },
  ...args: unknown[]
) => unknown[];
/**
 *
 */
type ParameterMetadataGetTypeMap = Map<number, ParameterMetadataGetType[]>;
type ParameterMetadataGetType = {
  type: ConstructableType;
  data: unknown;
  callback?: ParameterMetadataCallbackType;
};
type ParameterMetadataSetType = {
  data?: unknown;
  callback?: ParameterMetadataCallbackType;
};
type ParameterCallbackType = (target: object, propertyKey: string | symbol, parameterIndex: number) => unknown | void;
type ParameterMetadataCallbackType = (
  value: unknown,
  metadata: {
    classType: object | undefined;
    classData: unknown | undefined;
    methodType: ConstructableType | undefined;
    methodData: unknown | undefined;
    parameterType: ConstructableType | undefined;
    parameterData: unknown | undefined;
  },
) => unknown;

export class DecoratorService {
  public readonly symbol: symbol;

  public constructor(symbol: string) {
    this.symbol = Symbol(symbol);
  }

  public static getClassMetadata(symbol: symbol, target: object): ClassMetadataGetType | undefined {
    return Reflect.getOwnMetadata(symbol, target.constructor) as ClassMetadataGetType;
  }

  public static setClassMetadata(symbol: symbol, target: object, metadata: ClassMetadataSetType): void {
    const classMetadata: ClassMetadataGetType = {
      type: target.constructor,
      data: metadata.data,
    };
    Reflect.defineMetadata(symbol, classMetadata, target);
  }

  public static getMethodMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol,
  ): MethodMetadataGetType | undefined {
    return (Reflect.getOwnMetadata(symbol, target.constructor, propertyKey) || {}) as MethodMetadataGetType;
  }

  public static setMethodMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol | undefined,
    metadata: MethodMetadataSetType,
  ): void {
    const designMetadata = DecoratorService.getDesignMetadata(target, propertyKey || DecoratorService.name);
    const methodMetadata: MethodMetadataGetType = {
      type: designMetadata.type,
      data: metadata.data,
      before: metadata.before,
      after: metadata.after,
    };
    Reflect.defineMetadata(symbol, methodMetadata, target.constructor, propertyKey || DecoratorService.name);
  }

  public static getParameterMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol | undefined,
  ): ParameterMetadataGetTypeMap | undefined {
    return (Reflect.getOwnMetadata(symbol, target, propertyKey || DecoratorService.name) ||
      new Map()) as ParameterMetadataGetTypeMap;
  }

  public static setParameterMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
    metadata: ParameterMetadataSetType,
  ): void {
    const designMetadata = DecoratorService.getDesignMetadata(target, propertyKey || DecoratorService.name);
    const parameterMetadata: ParameterMetadataGetType = {
      type: designMetadata.paramtypes[parameterIndex],
      data: metadata.data,
      callback: metadata.callback,
    };
    const current = DecoratorService.getParameterMetadata(symbol, target, propertyKey);
    current?.set(parameterIndex, [parameterMetadata, ...(current?.get(parameterIndex) || [])]);
    Reflect.defineMetadata(symbol, current, target, propertyKey || DecoratorService.name);
  }

  private static getDesignMetadata(target: object, propertyKey: string | symbol): DesignMetadataInterface {
    return {
      type: Reflect.getOwnMetadata('design:type', target, propertyKey) as ConstructableType,
      paramtypes: Reflect.getOwnMetadata('design:paramtypes', target, propertyKey) as ConstructableType[],
      returntype: Reflect.getOwnMetadata('design:returntype', target, propertyKey) as ConstructableType,
    };
  }

  private static copyProperties(from: FunctionType, to: FunctionType, propertyKey: string | symbol): void {
    Object.getOwnPropertyNames(from).forEach((property) => {
      Object.defineProperty(to, property, { value: propertyKey });
    });
  }

  private static applyParameterDecorator(
    symbol: symbol,
    target: ConstructableType,
    propertyKey: string | symbol,
    ...args: unknown[]
  ): unknown[] {
    const classMetadata = DecoratorService.getClassMetadata(symbol, target);
    const methodMetadata = DecoratorService.getMethodMetadata(symbol, target, propertyKey);
    const parameterMetadata = DecoratorService.getParameterMetadata(symbol, target, propertyKey);
    return args.map((value, index) => {
      const item = parameterMetadata?.get(index);
      return !item
        ? value
        : item.reduce((acc, { callback, data, type }) => {
            return callback
              ? callback(acc, {
                  classType: classMetadata?.type,
                  classData: classMetadata?.data,
                  methodType: methodMetadata?.type,
                  methodData: methodMetadata?.data,
                  parameterType: type,
                  parameterData: data,
                })
              : acc;
          }, value);
    });
  }

  public decorateClass(callback?: ClassCallbackType): ClassDecorator {
    return <T>(target: object): T | void => {
      if (callback) {
        const result = callback(target) as T;
        if (result) {
          return result;
        }
      }
    };
  }

  public decorateMethod(callback?: MethodCallbackType): MethodDecorator {
    return <T>(target: ConstructableType, propertyKey: string | symbol, descriptor: PropertyDescriptor): T | void => {
      const symbol = this.symbol;
      const descriptorValue = descriptor.value as FunctionType;
      descriptor.value = function (...args: unknown[]): FunctionType {
        if (callback) {
          callback(target, propertyKey);
        }
        const classMetadata = DecoratorService.getClassMetadata(symbol, target);
        const methodMetadata = DecoratorService.getMethodMetadata(symbol, target, propertyKey);
        const metadata = {
          classType: classMetadata?.type,
          classData: classMetadata?.data,
          methodType: methodMetadata?.type,
          methodData: methodMetadata?.data,
        };
        const beforeArgs = methodMetadata?.before ? methodMetadata.before(metadata, ...args) : args;
        if (methodMetadata?.after) {
          return methodMetadata.after(
            metadata,
            ...(descriptorValue.apply(
              this,
              DecoratorService.applyParameterDecorator(symbol, target, propertyKey, ...beforeArgs),
            ) as unknown[]),
          ) as unknown as FunctionType;
        }
        return descriptorValue.apply(
          this,
          DecoratorService.applyParameterDecorator(symbol, target, propertyKey, ...beforeArgs),
        ) as FunctionType;
      };
      DecoratorService.copyProperties(descriptorValue, descriptor.value as FunctionType, propertyKey);
    };
  }

  public decorateParameter(callback?: ParameterCallbackType): ParameterDecorator {
    return <T>(target: ConstructableType, propertyKey: string | symbol, parameterIndex: number): T | void => {
      if (callback) {
        const result = callback(target, propertyKey, parameterIndex) as T;
        if (result) {
          return result;
        }
      }
    };
  }
}
