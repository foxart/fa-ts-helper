//todo loosing context
import { DecoratorNew } from './decorator';

export const ParamDecoratorNew = (name: string, callback: CallableFunction, data: unknown): ParameterDecorator => {
  return function (target, propertyKey, parameterIndex): void {
    // @ts-ignore
    console.log(this, '<<<');
    if (!DecoratorNew.getCallback(name)) {
      DecoratorNew.setCallback(name, callback);
    }
    const metadataMap = DecoratorNew.getMetadata(target, propertyKey);
    const metadata = (metadataMap.get(parameterIndex) || []).concat({
      decoratorName: name,
      decoratorData: data,
    });
    metadataMap.set(parameterIndex, metadata);
    DecoratorNew.setMetadata(target, propertyKey, metadataMap);
  };
};
