import { DecoratorService } from '../../services/decorator.service';

abstract class AbstractClass {}

export class ExtendedAbstractClass extends AbstractClass {}

export class DecoratorServiceParamKeyDto {
  public key: string;
}

export class DecoratorServiceParamValueDto {
  public value: number;
}

export class DecoratorServiceMethodEntity {
  public key: string;
  public value: number;
}

const Decorator = new DecoratorService('__FA_DECORATOR__');
export const ClassDecorator = (data: string): ClassDecorator => {
  return Decorator.decorateClass({
    data: data,
  });
};
export const MethodDecorator = (data: string): MethodDecorator => {
  return Decorator.decorateMethod({
    data: data,
    beforeParameterCallback: (metadata, ...params): unknown[] => {
      // console.log(`${MethodDecorator.name}-beforeParameter`, params);
      console.log(`${MethodDecorator.name}-beforeParameter`, metadata);
      const keyDto = params[0] as DecoratorServiceParamKeyDto;
      const valueDto = params[1] as DecoratorServiceParamValueDto;
      keyDto.key = `beforeParameter-${keyDto.key}`;
      valueDto.value = valueDto.value * 10;
      return params;
    },
    afterResultCallback: (metadata, result): unknown => {
      // console.log(`${MethodDecorator.name}-afterResult`, result);
      // console.log(`${MethodDecorator.name}-afterResult`, metadata);
      const methodEntity = result as DecoratorServiceMethodEntity;
      methodEntity.key = `${methodEntity.key}-afterResult`;
      methodEntity.value = methodEntity.value / 10;
      return result;
    },
  });
};
export const MethodDecoratorArray = (data: string): MethodDecorator => {
  return Decorator.decorateMethod({
    data: data,
    beforeParameterCallback: (metadata, ...params): unknown[] => {
      // console.log(`${MethodDecoratorArray.name}-beforeParameter`, params);
      // console.log(`${MethodDecoratorArray.name}-beforeParameter`, metadata);
      const keyDto = params[0] as DecoratorServiceParamKeyDto;
      const valueDto = params[1] as DecoratorServiceParamValueDto;
      keyDto.key = `beforeParameter-${keyDto.key}`;
      valueDto.value = valueDto.value * 10;
      return params;
    },
    afterResultCallback: (metadata, result): unknown => {
      // console.log(`${MethodDecoratorArray.name}-afterResult`, result);
      // console.log(`${MethodDecoratorArray.name}-afterResult`, metadata);
      const methodEntity = result as DecoratorServiceMethodEntity[];
      methodEntity[0].key = `${methodEntity[0].key}-afterResult`;
      methodEntity[0].value = methodEntity[0].value / 10;
      return result;
    },
  });
};
export const ParamKeyDto = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter({
    data: data,
    callback: (metadata, param: DecoratorServiceParamKeyDto): unknown => {
      // console.log(ParamKeyDto.name, param);
      console.log(ParamKeyDto.name, metadata);
      return param;
    },
  });
};
export const ParamValueDto = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter({
    data: data,
    callback: (metadata, param: DecoratorServiceParamValueDto): unknown => {
      // console.log(ParamValueDto.name, param);
      // console.log(ParamValueDto.name, metadata);
      return param;
    },
  });
};
export const ParamValueDtoMultiple = (multiplier: number): ParameterDecorator => {
  return Decorator.decorateParameter({
    data: multiplier,
    callback: (metadata, param: DecoratorServiceParamValueDto): unknown => {
      // console.log(ParamValueDtoMultiple.name, param, multiplier);
      // console.log(ParamValueDtoMultiple.name, metadata);
      param.value = param.value * (metadata.parameterData as number);
      return param;
    },
  });
};
