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
type MethodMetadataType = {
  classType?: object;
  classData?: unknown;
  methodData?: unknown;
  methodType?: ConstructableType;
  methodParameterType?: ConstructableType[];
  methodReturnType?: ConstructableType | ConstructableType[];
};
type MethodMetadataCallbackType = (metadata: MethodMetadataType, ...args: unknown[]) => unknown;
type MethodMetadataGetType = {
  type: ConstructableType;
  parameterType: ConstructableType[];
  returnType: ConstructableType;
  data?: unknown;
  before?: MethodMetadataCallbackType;
  after?: MethodMetadataCallbackType;
};
type MethodMetadataSetType = {
  data?: unknown;
  before?: MethodMetadataCallbackType;
  after?: MethodMetadataCallbackType;
};
/**
 *
 */
type ParameterCallbackType = () => ParameterMetadataSetType | void;
type ParameterMetadataType = (
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
  callback?: ParameterMetadataType;
};
type ParameterMetadataSetType = {
  data?: unknown;
  callback?: ParameterMetadataType;
};

export class DecoratorService {
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
    return (Reflect.getOwnMetadata(symbol, target, propertyKey || DecoratorService.name) ||
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

  private static handleParameters(
    symbol: symbol,
    target: ConstructableType,
    propertyKey: string | symbol,
    ...args: unknown[]
  ): unknown[] {
    const classMetadata = DecoratorService.getClassMetadata(symbol, target.constructor);
    const methodMetadata = DecoratorService.getMethodMetadata(symbol, target.constructor, propertyKey);
    const parameterMetadata = DecoratorService.getParameterMetadata(symbol, target, propertyKey);
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

  private static copyDescriptorProperties(from: FunctionType, to: FunctionType, propertyKey: string | symbol): void {
    Object.getOwnPropertyNames(from).forEach((property) => {
      Object.defineProperty(to, property, { value: propertyKey });
    });
  }

  private static rewriteDescriptorAsync(
    target: ConstructableType,
    propertyKey: string | symbol,
    originMethod: FunctionType,
    symbol: symbol,
    context: PropertyDescriptor,
  ): (...args: unknown[]) => Promise<FunctionType> {
    return async (...args: unknown[]): Promise<FunctionType> => {
      const classMetadata = DecoratorService.getClassMetadata(symbol, target.constructor);
      const methodMetadata = DecoratorService.getMethodMetadata(symbol, target.constructor, propertyKey);
      const metadata: MethodMetadataType = {
        classType: classMetadata?.type,
        classData: classMetadata?.data,
        methodType: methodMetadata?.type,
        methodParameterType: methodMetadata?.parameterType,
        methodReturnType: methodMetadata?.returnType,
        methodData: methodMetadata?.data,
      };
      if (methodMetadata?.after) {
        const beforeArgs = DecoratorService.handleParameters(
          symbol,
          target,
          propertyKey,
          ...((methodMetadata?.before ? methodMetadata.before(metadata, ...args) : args) as unknown[]),
        );
        return methodMetadata.after(metadata, await originMethod.apply(context, beforeArgs)) as FunctionType;
      } else {
        return (await originMethod.apply(
          context,
          DecoratorService.handleParameters(
            symbol,
            target,
            propertyKey,
            ...((methodMetadata?.before ? methodMetadata.before(metadata, ...args) : args) as unknown[]),
          ),
        )) as FunctionType;
      }
    };
  }

  private static rewriteDescriptorSync(
    target: ConstructableType,
    propertyKey: string | symbol,
    originMethod: FunctionType,
    symbol: symbol,
    context: PropertyDescriptor,
  ): (...args: unknown[]) => FunctionType {
    return (...args: unknown[]): FunctionType => {
      const classMetadata = DecoratorService.getClassMetadata(symbol, target.constructor);
      const methodMetadata = DecoratorService.getMethodMetadata(symbol, target.constructor, propertyKey);
      const metadata: MethodMetadataType = {
        classType: classMetadata?.type,
        classData: classMetadata?.data,
        methodType: methodMetadata?.type,
        methodParameterType: methodMetadata?.parameterType,
        methodReturnType: methodMetadata?.returnType,
        methodData: methodMetadata?.data,
      };
      if (methodMetadata?.after) {
        const beforeArgs = DecoratorService.handleParameters(
          symbol,
          target,
          propertyKey,
          ...((methodMetadata?.before ? methodMetadata.before(metadata, ...args) : args) as unknown[]),
        );
        return methodMetadata.after(metadata, originMethod.apply(context, beforeArgs)) as FunctionType;
      } else {
        return originMethod.apply(
          context,
          DecoratorService.handleParameters(
            symbol,
            target,
            propertyKey,
            ...((methodMetadata?.before ? methodMetadata.before(metadata, ...args) : args) as unknown[]),
          ),
        ) as FunctionType;
      }
    };
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
    const symbol = this.symbol;
    return (
      target: ConstructableType,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ): PropertyDescriptor => {
      const originalMethod = descriptor.value as FunctionType;
      const callbackResult = callback ? callback() : undefined;
      const callbackDesignMetadata = DecoratorService.getDesignMetadata(target, propertyKey || DecoratorService.name);
      const callbackMethodMetadata: MethodMetadataGetType = {
        type: callbackDesignMetadata.type,
        parameterType: callbackDesignMetadata.paramtypes,
        returnType: callbackDesignMetadata.returntype,
        data: callbackResult?.data,
        before: callbackResult?.before,
        after: callbackResult?.after,
      };
      Reflect.defineMetadata(symbol, callbackMethodMetadata, target.constructor, propertyKey || DecoratorService.name);
      descriptor.value = function (...args: unknown[]): unknown {
        // return callbackDesignMetadata.returntype === Promise
        //   ? DecoratorService.rewriteDescriptorAsync(target, propertyKey, originalMethod, symbol, this)(args)
        //   : DecoratorService.rewriteDescriptorSync(target, propertyKey, originalMethod, symbol, this)(args);
        return DecoratorService.rewriteDescriptorAsync(target, propertyKey, originalMethod, symbol, this)(args);
      };
      DecoratorService.copyDescriptorProperties(originalMethod, descriptor.value as FunctionType, propertyKey);
      return descriptor;
    };
  }

  public decorateParameter(callback?: ParameterCallbackType): ParameterDecorator {
    return <T>(target: ConstructableType, propertyKey: string | symbol, parameterIndex: number): T | void => {
      const callbackResult = callback ? callback() : undefined;
      const callbackDesignMetadata = DecoratorService.getDesignMetadata(target, propertyKey || DecoratorService.name);
      const callbackParameterMetadata: ParameterMetadataGetType = {
        type: callbackDesignMetadata.paramtypes[parameterIndex],
        data: callbackResult?.data,
        callback: callbackResult?.callback,
      };
      const parameterMetadata = DecoratorService.getParameterMetadata(this.symbol, target, propertyKey);
      parameterMetadata?.set(parameterIndex, [
        callbackParameterMetadata,
        ...(parameterMetadata?.get(parameterIndex) || []),
      ]);
      Reflect.defineMetadata(this.symbol, parameterMetadata, target, propertyKey || DecoratorService.name);
    };
  }
}
