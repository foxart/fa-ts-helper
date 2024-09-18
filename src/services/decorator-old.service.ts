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
type ClassCallbackType = () => ClassMetadataSetType | void;
type ClassMetadataGetType = {
  data?: unknown;
  type: object;
};
type ClassMetadataSetType = {
  data?: unknown;
};
/**
 *
 */
type MethodCallbackType = () => MethodMetadataSetType | void;
type MethodMetadataCallbackType = {
  classType?: object;
  classData?: unknown;
  methodData?: unknown;
  methodType?: ConstructableType;
  methodParameterType?: ConstructableType[];
  methodReturnType?: ConstructableType | ConstructableType[];
};
type MethodMetadataGetType = {
  type: ConstructableType;
  parameterType: ConstructableType[];
  returnType: ConstructableType;
  data?: unknown;
  before?: MethodMetadataBeforeCallbackType;
  after?: MethodMetadataAfterCallbackType;
};
type MethodMetadataSetType = {
  data?: unknown;
  before?: MethodMetadataBeforeCallbackType;
  after?: MethodMetadataAfterCallbackType;
};
type MethodMetadataBeforeCallbackType = (metadata: MethodMetadataCallbackType, ...args: unknown[]) => unknown[];
type MethodMetadataAfterCallbackType = (metadata: MethodMetadataCallbackType, arg?: unknown | unknown[]) => unknown;
/**
 *
 */
type ParameterCallbackType = () => ParameterMetadataSetType | void;
type ParameterMetadataCallbackType = (
  metadata: {
    classType?: object;
    classData?: unknown;
    methodData?: unknown;
    methodType?: ConstructableType;
    methodParameterType?: ConstructableType[];
    methodReturnType?: ConstructableType;
    parameterType: ConstructableType;
    parameterData: unknown;
  },
  arg: unknown,
) => unknown;
type ParameterMetadataGetTypeMap = Map<number, ParameterMetadataGetType[]>;
type ParameterMetadataGetType = {
  type: ConstructableType;
  data?: unknown;
  callback?: ParameterMetadataCallbackType;
};
type ParameterMetadataSetType = {
  data?: unknown;
  callback?: ParameterMetadataCallbackType;
};

export class DecoratorOldService {
  private readonly symbol: symbol;

  public constructor(symbol: string) {
    this.symbol = Symbol(symbol);
  }

  /**
   * STATIC
   */
  private static getClassMetadata(symbol: symbol, target: object): ClassMetadataGetType | undefined {
    return Reflect.getOwnMetadata(symbol, target) as ClassMetadataGetType;
  }

  private static getMethodMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol,
  ): MethodMetadataGetType | undefined {
    return (Reflect.getOwnMetadata(symbol, target, propertyKey) || {}) as MethodMetadataGetType;
  }

  private static getParameterMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol | undefined,
  ): ParameterMetadataGetTypeMap | undefined {
    return (Reflect.getOwnMetadata(symbol, target, propertyKey || DecoratorOldService.name) ||
      new Map()) as ParameterMetadataGetTypeMap;
  }

  /**
   * PRIVATE
   */
  private static getDesignMetadata(target: object, propertyKey: string | symbol): DesignMetadataInterface {
    return {
      type: Reflect.getMetadata('design:type', target, propertyKey) as ConstructableType,
      paramtypes: Reflect.getMetadata('design:paramtypes', target, propertyKey) as ConstructableType[],
      returntype: Reflect.getMetadata('design:returntype', target, propertyKey) as ConstructableType,
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
    const classMetadata = DecoratorOldService.getClassMetadata(symbol, target.constructor);
    const methodMetadata = DecoratorOldService.getMethodMetadata(symbol, target.constructor, propertyKey);
    const parameterMetadata = DecoratorOldService.getParameterMetadata(symbol, target, propertyKey);
    return args.map((value, index) => {
      const item = parameterMetadata?.get(index);
      return item
        ? item.reverse().reduce((acc, { callback, data, type }) => {
            return callback
              ? callback(
                  {
                    classType: classMetadata?.type,
                    classData: classMetadata?.data,
                    methodData: methodMetadata?.data,
                    methodType: methodMetadata?.type,
                    methodParameterType: methodMetadata?.parameterType,
                    methodReturnType: methodMetadata?.returnType,
                    parameterType: type,
                    parameterData: data,
                  },
                  acc,
                )
              : acc;
          }, value)
        : value;
    });
  }

  /**
   * PUBLIC
   */
  public decorateClass(callback?: ClassCallbackType): ClassDecorator {
    return <T>(target: object): T | void => {
      const callbackResult = callback ? callback() : undefined;
      const callbackClassMetadata: ClassMetadataGetType = {
        type: target,
        data: callbackResult?.data,
      };
      Reflect.defineMetadata(this.symbol, callbackClassMetadata, target);
    };
  }

  public decorateMethod(callback?: MethodCallbackType): MethodDecorator {
    return <T>(target: ConstructableType, propertyKey: string | symbol, descriptor: PropertyDescriptor): T | void => {
      const symbol = this.symbol;
      const descriptorValue = descriptor.value as FunctionType;
      const callbackResult = callback ? callback() : undefined;
      const callbackDesignMetadata = DecoratorOldService.getDesignMetadata(
        target,
        propertyKey || DecoratorOldService.name,
      );
      const callbackMethodMetadata: MethodMetadataGetType = {
        type: callbackDesignMetadata.type,
        parameterType: callbackDesignMetadata.paramtypes,
        returnType: callbackDesignMetadata.returntype,
        data: callbackResult?.data,
        before: callbackResult?.before,
        after: callbackResult?.after,
      };
      Reflect.defineMetadata(
        symbol,
        callbackMethodMetadata,
        target.constructor,
        propertyKey || DecoratorOldService.name,
      );
      descriptor.value = async function (...args: unknown[]): Promise<FunctionType> {
        const classMetadata = DecoratorOldService.getClassMetadata(symbol, target.constructor);
        const methodMetadata = DecoratorOldService.getMethodMetadata(symbol, target.constructor, propertyKey);
        const metadata: MethodMetadataCallbackType = {
          classType: classMetadata?.type,
          classData: classMetadata?.data,
          methodType: methodMetadata?.type,
          methodParameterType: methodMetadata?.parameterType,
          methodReturnType: methodMetadata?.returnType,
          methodData: methodMetadata?.data,
        };
        if (methodMetadata?.after) {
          let result = descriptorValue.apply(
            this,
            DecoratorOldService.applyParameterDecorator(
              symbol,
              target,
              propertyKey,
              ...(methodMetadata?.before ? methodMetadata.before(metadata, ...args) : args),
            ),
          );
          if (result instanceof Promise) {
            result = await result;
          }
          return methodMetadata.after(metadata, result) as FunctionType;
        }
        return descriptorValue.apply(
          this,
          DecoratorOldService.applyParameterDecorator(
            symbol,
            target,
            propertyKey,
            ...(methodMetadata?.before ? methodMetadata.before(metadata, ...args) : args),
          ),
        ) as FunctionType;
      };
      DecoratorOldService.copyProperties(descriptorValue, descriptor.value as FunctionType, propertyKey);
    };
  }

  public decorateParameter(callback?: ParameterCallbackType): ParameterDecorator {
    return <T>(target: ConstructableType, propertyKey: string | symbol, parameterIndex: number): T | void => {
      const callbackResult = callback ? callback() : undefined;
      const callbackDesignMetadata = DecoratorOldService.getDesignMetadata(
        target,
        propertyKey || DecoratorOldService.name,
      );
      const callbackParameterMetadata: ParameterMetadataGetType = {
        type: callbackDesignMetadata.paramtypes[parameterIndex],
        data: callbackResult?.data,
        callback: callbackResult?.callback,
      };
      const current = DecoratorOldService.getParameterMetadata(this.symbol, target, propertyKey);
      current?.set(parameterIndex, [callbackParameterMetadata, ...(current?.get(parameterIndex) || [])]);
      Reflect.defineMetadata(this.symbol, current, target, propertyKey || DecoratorOldService.name);
    };
  }
}
