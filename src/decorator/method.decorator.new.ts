//todo loosing context
import { DecoratorNew, MetadataMapType } from './decorator';
import { ConsoleHelper } from '../helper/console.helper';

const Console = new ConsoleHelper({ index: 1 });

/**
 *
 */
function getDecoratorValueProcessor(
  context: unknown,
  metadataMap: MetadataMapType,
  key: number,
  value: unknown,
): unknown {
  return ((metadataMapValueTypeArray, propertyValue): unknown => {
    /** handle multiple decorators */
    return [...metadataMapValueTypeArray].reverse().reduce((payload, param) => {
      // @ts-ignore
      return DecoratorNew.getCallback(param.decoratorName).apply(context, [param.decoratorData, payload]);
      // return payload;
    }, propertyValue);
  })(metadataMap.get(key) || [], value);
}

export const MethodDecoratorNew = (): MethodDecorator => {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const metadataMap = DecoratorNew.getMetadata(target, propertyKey);
    return {
      get: function () {
        (descriptor.value as (...args: unknown[]) => unknown).bind(this);
        Console.info(descriptor.value, this, 'XXX');
        return (...parameterValueList: unknown[]): void => {
          // Console.info(descriptor.value.name, '<<<');
          const result = parameterValueList.map((value, key) => {
            return metadataMap.has(key) ? getDecoratorValueProcessor(descriptor.value, metadataMap, key, value) : value;
          });
          Console.info(descriptor.value, this);
          (descriptor.value as (...args: unknown[]) => unknown).apply(this, result);
        };
      },
    };
  };
};

export function DecorateParameterType(data?: unknown): ParameterDecorator {
  return (target: object, propertyKey: string | symbol, parameterIndex: number): void => {
    const functionParamsTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey) as ((
      ...args: unknown[]
    ) => unknown)[];
    const paramType = functionParamsTypes[parameterIndex];
    Console.log(data, `Parameter type of ${String(propertyKey)} at index ${parameterIndex} is: ${paramType.name}`);
  };
}

const PARAMS_KEY = Symbol('params');

export function DecorateParameter(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol, parameterIndex: number): void => {
    const existingParams = (Reflect.getOwnMetadata(PARAMS_KEY, target, propertyKey) as number[]) || [];
    existingParams.push(parameterIndex);
    Reflect.defineMetadata(PARAMS_KEY, existingParams, target, propertyKey);
  };
}

export function DecorateMethod(): MethodDecorator {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    const method = descriptor.value as (...args: unknown[]) => unknown;
    descriptor.value = function (...args: unknown[]): unknown {
      const paramIndexesToChange: number[] =
        (Reflect.getOwnMetadata(PARAMS_KEY, target, propertyKey) as number[]) || [];
      for (const index of paramIndexesToChange) {
        args[index] = `${args[index] as string} changed`;
      }
      return method.apply(this, args);
    };
    Object.getOwnPropertyNames(method).forEach((property) => {
      Object.defineProperty(descriptor.value, property, { value: property });
    });
  };
}
