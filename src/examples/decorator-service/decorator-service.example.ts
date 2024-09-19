import { DecoratorService } from '../../index';
import {
  DecoratorServiceClass,
  DecoratorServiceMethodEntity,
  DecoratorServiceParamKeyDto,
  DecoratorServiceParamValueDto,
} from './decorator-service.common';

const Decorator = new DecoratorService('__FA_DECORATOR__');
const ClassDecorator = (data: string): ClassDecorator => {
  return Decorator.decorateClass({
    data: data,
  });
};
const MethodDecorator = (data: string): MethodDecorator => {
  return Decorator.decorateMethod({
    data: data,
    beforeParameterCallback: (metadata, ...params): unknown[] => {
      console.log(`${MethodDecorator.name}Before`, params);
      // console.log(`${MethodDecorator.name}Before`, metadata);
      const paramDataDto = params[0] as DecoratorServiceParamValueDto;
      const paramObjectDto = params[1] as DecoratorServiceParamKeyDto;
      paramDataDto.value = paramDataDto.value * 10;
      paramObjectDto.key = `beforeParameter-${paramObjectDto.key}`;
      return params;
    },
    afterResultCallback: (metadata, result): unknown => {
      console.log(`${MethodDecorator.name}After`, result);
      // console.log(`${MethodDecorator.name}After`, metadata);
      const methodEntity = result as DecoratorServiceMethodEntity;
      methodEntity.key = `${methodEntity.key}-afterResult`;
      methodEntity.value = methodEntity.value / 10;
      return result;
    },
  });
};
const MethodDecoratorArray = (data: string): MethodDecorator => {
  return Decorator.decorateMethod({
    data: data,
    beforeParameterCallback: (metadata, ...params): unknown[] => {
      console.log(`${MethodDecoratorArray.name}Before`, params);
      // console.log(`${MethodDecoratorArray.name}Before`, metadata);
      const paramDataDto = params[0] as DecoratorServiceParamValueDto;
      const paramObjectDto = params[1] as DecoratorServiceParamKeyDto;
      paramObjectDto.key = `beforeParameter-${paramObjectDto.key}`;
      paramDataDto.value = paramDataDto.value * 10;
      return params;
    },
    afterResultCallback: (metadata, result): unknown => {
      console.log(`${MethodDecoratorArray.name}After`, result);
      // console.log(`${MethodDecoratorArray.name}After`, metadata);
      const methodEntity = result as DecoratorServiceMethodEntity[];
      methodEntity[0].key = `${methodEntity[0].key}-afterResult`;
      methodEntity[0].value = methodEntity[0].value / 10;
      return result;
    },
  });
};
const ParamDataDto = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter({
    data: data,
    callback: (metadata, param: DecoratorServiceParamValueDto): unknown => {
      console.log(ParamDataDto.name, param);
      // console.log(ParamDataDto.name, metadata);
      return param;
    },
  });
};
const ParamDataDtoMultiple = (multiplier: number): ParameterDecorator => {
  return Decorator.decorateParameter({
    data: multiplier,
    callback: (metadata, param: DecoratorServiceParamValueDto): unknown => {
      console.log(ParamDataDtoMultiple.name, param, multiplier);
      // console.log(ParamDataDtoMultiple.name, metadata);
      param.value = param.value * (metadata.parameterData as number);
      return param;
    },
  });
};
const ParamObjectDto = (data: string): ParameterDecorator => {
  return Decorator.decorateParameter({
    data: data,
    callback: (metadata, param: DecoratorServiceParamKeyDto): unknown => {
      // console.log('ParamObjectDto', param);
      // console.log('ParamObjectDto', metadata);
      return param;
    },
  });
};

@ClassDecorator('DecoratorServiceAsync')
class DecoratorServiceAsync extends DecoratorServiceClass {
  @MethodDecorator('testSync')
  public testSync(
    @ParamDataDto('dataDto')
    @ParamDataDtoMultiple(3)
    dataDto: DecoratorServiceParamValueDto,
    @ParamObjectDto('objectDto')
    objectDto: DecoratorServiceParamKeyDto,
  ): DecoratorServiceMethodEntity {
    console.info([this.constructor.name, this.testSync.name], { data: dataDto, object: objectDto });
    return {
      key: objectDto.key,
      value: dataDto.value + 1,
    };
  }

  @MethodDecoratorArray('testSyncArray')
  public testSyncArray(
    @ParamDataDto('dataDto')
    @ParamDataDtoMultiple(3)
    dataDto: DecoratorServiceParamValueDto,
    @ParamObjectDto('objectDto')
    objectDto: DecoratorServiceParamKeyDto,
  ): DecoratorServiceMethodEntity[] {
    console.info([this.constructor.name, this.testSyncArray.name], { data: dataDto, object: objectDto });
    return [
      {
        key: objectDto.key,
        value: dataDto.value + 1,
      },
      {
        key: objectDto.key,
        value: dataDto.value,
      },
    ];
  }

  @MethodDecorator('testAsync')
  public async testAsync(
    @ParamDataDto('dataDto')
    @ParamDataDtoMultiple(3)
    dataDto: DecoratorServiceParamValueDto,
    @ParamObjectDto('objectDto')
    objectDto: DecoratorServiceParamKeyDto,
  ): Promise<DecoratorServiceMethodEntity> {
    console.info([this.constructor.name, this.testAsync.name], { data: dataDto, object: objectDto });
    return await new Promise((resolve) => {
      resolve({
        key: objectDto.key,
        value: dataDto.value + 1,
      });
    });
  }
}

export function runSync(): void {
  const decoratorServiceAsync = new DecoratorServiceAsync();
  const dataDto: DecoratorServiceParamValueDto = { value: 1 };
  const objectDto: DecoratorServiceParamKeyDto = { key: 'key' };
  // console.error(decoratorServiceAsync.testSync(dataDto, objectDto));
  console.error(decoratorServiceAsync.testSyncArray(dataDto, objectDto));
}

export async function runAsync(): Promise<void> {
  const decoratorServiceAsync = new DecoratorServiceAsync();
  const dataDto: DecoratorServiceParamValueDto = { value: 1 };
  const objectDto: DecoratorServiceParamKeyDto = { key: 'key' };
  console.error(await decoratorServiceAsync.testAsync(dataDto, objectDto));
}
