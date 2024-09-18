import 'reflect-metadata';

type FunctionType = (...args: unknown[]) => unknown;
type ConstructableType = new (...args: unknown[]) => unknown;

interface DesignMetadataInterface {
  type: ConstructableType;
  paramtypes: ConstructableType[];
  returntype: ConstructableType;
}

// CLASS
interface ClassDecoratorInterface {
  data?: unknown;
}

interface ClassMetadataInterface {
  type?: object;
  data?: unknown;
}

// METHOD
interface MethodDecoratorInterface {
  data?: unknown;
  beforeParameterCallback?: MethodBeforeParameterCallbackMetadataType;
  afterResultCallback?: MethodAfterResultCallbackMetadataType;
}

interface MethodCallbackMetadataInterface {
  classType?: object;
  classData?: unknown;
  methodData?: unknown;
  methodType?: ConstructableType;
  methodParameterType?: ConstructableType[];
  methodReturnType?: ConstructableType | ConstructableType[];
}

type MethodBeforeParameterCallbackMetadataType = (
  metadata: MethodCallbackMetadataInterface,
  ...parameters: unknown[]
) => unknown[];
type MethodAfterResultCallbackMetadataType = (
  metadata: MethodCallbackMetadataInterface,
  result: unknown | unknown[],
) => unknown | unknown[];

interface MethodMetadataInterface {
  type: ConstructableType;
  parameterType: ConstructableType[];
  returnType: ConstructableType;
  data?: unknown;
  beforeParameter?: MethodBeforeParameterCallbackMetadataType;
  afterResult?: MethodAfterResultCallbackMetadataType;
}

// PARAMETER
interface ParameterDecoratorInterface {
  data?: unknown;
  callback?: ParameterCallbackMetadataType;
}

interface ParameterCallbackMetadataInterface {
  classType?: object;
  classData?: unknown;
  methodData?: unknown;
  methodType?: ConstructableType;
  methodParameterType?: ConstructableType[];
  methodReturnType?: ConstructableType | ConstructableType[];
  parameterType: ConstructableType;
  parameterData: unknown;
}

type ParameterCallbackMetadataType = (metadata: ParameterCallbackMetadataInterface, parameter: unknown) => unknown;

interface ParameterMetadataInterface {
  type: ConstructableType;
  data?: unknown;
  callback?: ParameterCallbackMetadataType;
}

type ParameterMetadataMapType = Map<number, ParameterMetadataInterface[]>;
const DESIGN_TYPE = 'design:type';
const DESIGN_PARAMETER_TYPE_LIST = 'design:paramtypes';
const DESIGN_RETURN_TYPE = 'design:returntype';

export class DecoratorService {
  private readonly symbol: symbol;

  public constructor(symbol: string) {
    this.symbol = Symbol(symbol);
  }

  /* STATIC */
  private static getClassMetadata(symbol: symbol, target: object): ClassMetadataInterface | undefined {
    return Reflect.getOwnMetadata(symbol, target) as ClassMetadataInterface;
  }

  private static setClassMetadata(symbol: symbol, target: object, metadata: ClassMetadataInterface): void {
    Reflect.defineMetadata(symbol, metadata, target);
  }

  private static getMethodMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol,
  ): MethodMetadataInterface | undefined {
    return (Reflect.getOwnMetadata(symbol, target, propertyKey) || {}) as MethodMetadataInterface;
  }

  private static setMethodMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol,
    metadata: MethodMetadataInterface,
  ): void {
    Reflect.defineMetadata(symbol, metadata, target, propertyKey);
  }

  private static getParameterMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol,
  ): ParameterMetadataMapType {
    return (Reflect.getOwnMetadata(symbol, target, propertyKey) || new Map()) as ParameterMetadataMapType;
  }

  private static setParameterMetadata(
    symbol: symbol,
    target: object,
    propertyKey: string | symbol,
    metadata: ParameterMetadataMapType,
  ): void {
    Reflect.defineMetadata(symbol, metadata, target, propertyKey);
  }

  /* PRIVATE */
  private static getDesignMetadata(target: object, propertyKey: string | symbol): DesignMetadataInterface {
    return {
      type: Reflect.getOwnMetadata(DESIGN_TYPE, target, propertyKey) as ConstructableType,
      paramtypes: Reflect.getOwnMetadata(DESIGN_PARAMETER_TYPE_LIST, target, propertyKey) as ConstructableType[],
      returntype: Reflect.getOwnMetadata(DESIGN_RETURN_TYPE, target, propertyKey) as ConstructableType,
    };
  }

  private static handleParameters(
    symbol: symbol,
    target: ConstructableType,
    propertyKey: string | symbol,
    args: unknown[],
  ): unknown[] {
    const classMetadata = DecoratorService.getClassMetadata(symbol, target.constructor);
    const methodMetadata = DecoratorService.getMethodMetadata(symbol, target.constructor, propertyKey);
    const parameterMetadata = DecoratorService.getParameterMetadata(symbol, target, propertyKey);
    return args.map((value, index) => {
      const parameterMetadataList = parameterMetadata.get(index);
      return parameterMetadataList
        ? parameterMetadataList.reverse().reduce((acc, { callback, data, type }) => {
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

  private static copyDescriptorProperties(
    original: FunctionType,
    descriptor: FunctionType,
    propertyKey: string | symbol,
  ): void {
    Object.getOwnPropertyNames(original).forEach((property) => {
      Object.defineProperty(descriptor, property, { value: propertyKey });
    });
  }

  private static rewriteDescriptor(
    symbol: symbol,
    target: ConstructableType,
    propertyKey: string | symbol,
    originalMethod: FunctionType,
    context: PropertyDescriptor,
    async: boolean,
  ): (...args: unknown[]) => unknown | Promise<unknown> {
    // return async (...args: unknown[]): Promise<FunctionType> => {
    //   const beforeArgs = methodMetadata?.beforeParameter
    //     ? methodMetadata.beforeParameter(methodCallbackMetadata, ...args)
    //     : args;
    //   if (methodMetadata?.afterResult) {
    //     return methodMetadata.afterResult(
    //       methodCallbackMetadata,
    //       await originalMethod.apply(
    //         context,
    //         DecoratorService.handleParameters(symbol, target, propertyKey, beforeArgs),
    //       ),
    //     ) as FunctionType;
    //   } else {
    //     return (await originalMethod.apply(
    //       context,
    //       DecoratorService.handleParameters(symbol, target, propertyKey, beforeArgs),
    //     )) as FunctionType;
    //   }
    // };
    const classMetadata = DecoratorService.getClassMetadata(symbol, target.constructor);
    const methodMetadata = DecoratorService.getMethodMetadata(symbol, target.constructor, propertyKey);
    const methodCallbackMetadata: MethodCallbackMetadataInterface = {
      classType: classMetadata?.type,
      classData: classMetadata?.data,
      methodType: methodMetadata?.type,
      methodParameterType: methodMetadata?.parameterType,
      methodReturnType: methodMetadata?.returnType,
      methodData: methodMetadata?.data,
    };
    return async
      ? async (...args: unknown[]): Promise<unknown> => {
          const beforeArgs = methodMetadata?.beforeParameter
            ? methodMetadata.beforeParameter(methodCallbackMetadata, ...args)
            : args;
          const result = await originalMethod.apply(
            context,
            DecoratorService.handleParameters(symbol, target, propertyKey, beforeArgs),
          );
          return methodMetadata?.afterResult ? methodMetadata.afterResult(methodCallbackMetadata, result) : result;
        }
      : (...args: unknown[]): unknown => {
          const beforeArgs = methodMetadata?.beforeParameter
            ? methodMetadata.beforeParameter(methodCallbackMetadata, ...args)
            : args;
          const result = originalMethod.apply(
            context,
            DecoratorService.handleParameters(symbol, target, propertyKey, beforeArgs),
          );
          return methodMetadata?.afterResult ? methodMetadata.afterResult(methodCallbackMetadata, result) : result;
        };
  }

  /* PUBLIC */
  public decorateClass(data?: ClassDecoratorInterface): ClassDecorator {
    return <T>(target: object): T | void => {
      const classMetadata: ClassMetadataInterface = {
        type: target,
        data: data?.data,
      };
      DecoratorService.setClassMetadata(this.symbol, target, classMetadata);
    };
  }

  public decorateMethod(data?: MethodDecoratorInterface): MethodDecorator {
    return (
      target: ConstructableType,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ): PropertyDescriptor => {
      const symbol = this.symbol;
      const originalMethod = descriptor.value as FunctionType;
      const designMetadata = DecoratorService.getDesignMetadata(target, propertyKey);
      const methodMetadata: MethodMetadataInterface = {
        type: designMetadata.type,
        parameterType: designMetadata.paramtypes,
        returnType: designMetadata.returntype,
        data: data?.data,
        beforeParameter: data?.beforeParameterCallback,
        afterResult: data?.afterResultCallback,
      };
      DecoratorService.setMethodMetadata(symbol, target.constructor, propertyKey, methodMetadata);
      descriptor.value = function (...args: unknown[]): unknown {
        return DecoratorService.rewriteDescriptor(
          symbol,
          target,
          propertyKey,
          originalMethod,
          this,
          designMetadata.returntype === Promise,
        )(...args);
      };
      DecoratorService.copyDescriptorProperties(originalMethod, descriptor.value as FunctionType, propertyKey);
      return descriptor;
    };
  }

  public decorateParameter(data?: ParameterDecoratorInterface): ParameterDecorator {
    return <T>(target: ConstructableType, propertyKey: string | symbol, parameterIndex: number): T | void => {
      const designMetadata = DecoratorService.getDesignMetadata(target, propertyKey);
      const parameterMetadata: ParameterMetadataInterface = data
        ? {
            type: designMetadata.paramtypes[parameterIndex],
            data: data.data,
            callback: data.callback,
          }
        : {
            type: designMetadata.paramtypes[parameterIndex],
          };
      const parameterMetadataMap = DecoratorService.getParameterMetadata(this.symbol, target, propertyKey);
      if (parameterMetadataMap.has(parameterIndex)) {
        parameterMetadataMap.set(parameterIndex, [
          parameterMetadata,
          ...(parameterMetadataMap.get(parameterIndex) as ParameterMetadataInterface[]),
        ]);
      } else {
        parameterMetadataMap.set(parameterIndex, [parameterMetadata]);
      }
      DecoratorService.setParameterMetadata(this.symbol, target, propertyKey, parameterMetadataMap);
    };
  }
}
