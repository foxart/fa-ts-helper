//todo loosing context
import { DecoratorNew } from './decorator';

export const ParamDecoratorNew = (name: string, callback: CallableFunction, ...args: unknown[]): ParameterDecorator => {
  return (target, propertyKey, parameterIndex): void => {
    if (!DecoratorNew.getCallback(name)) {
      DecoratorNew.setCallback(name, callback);
    }
    const metadataMap = DecoratorNew.getMetadata(target, propertyKey);
    console.info({ args });
    const metadata = (metadataMap.get(parameterIndex) || []).concat({
      name,
      args,
    });
    metadataMap.set(parameterIndex, metadata);
    DecoratorNew.setMetadata(target, propertyKey, metadataMap);
  };
};
