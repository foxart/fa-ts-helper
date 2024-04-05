//todo loosing context
import { DecoratorNew, MetadataMapType } from './decorator';
import { logData } from '../../examples/common/logger';
import { ConsoleHelper } from '../helper/console.helper';

const Console = new ConsoleHelper({ index: 1 });
Console.console.clear();
export const MethodDecoratorNew = (): MethodDecorator => {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const metadataMap = DecoratorNew.getMetadata(target, propertyKey);
    return {
      get: function () {
        return (...parameterValueList: unknown[]) => {
          // console.log(descriptor.value, '<<<');
          // console.log(this, '<<<');
          return descriptor.value.apply(
            this,
            parameterValueList.map((value, key) => {
              return metadataMap.has(key)
                ? ((metadataMapValueTypeArray, propertyValue) => {
                    /** handle multiple decorators */
                    return [...metadataMapValueTypeArray].reverse().reduce((prev, curr) => {
                      Console.info(curr.args, 'XXX');
                      return DecoratorNew.getCallback(curr.name)(prev, ...curr.args);
                    }, propertyValue);
                  })(metadataMap.get(key) || [], value)
                : value;
            }),
          );
        };
      },
    };
  };
};
