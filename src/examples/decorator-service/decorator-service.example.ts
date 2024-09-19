import {
  ClassDecorator,
  DecoratorServiceMethodEntity,
  DecoratorServiceParamKeyDto,
  DecoratorServiceParamValueDto,
  ExtendedAbstractClass,
  MethodDecorator,
  MethodDecoratorArray,
  ParamValueDto,
  ParamValueDtoMultiple,
  ParamKeyDto,
} from './decorator-service.common';

@ClassDecorator('DecoratorServiceClassData')
class DecoratorServiceClass extends ExtendedAbstractClass {
  @MethodDecorator('testSync')
  public testSync(
    @ParamKeyDto(`${ParamKeyDto.name}-data`)
    keyDto: DecoratorServiceParamKeyDto,
    @ParamValueDto(`${ParamValueDto.name}-data`)
    @ParamValueDtoMultiple(3)
    valueDto: DecoratorServiceParamValueDto,
  ): DecoratorServiceMethodEntity {
    console.info([this.constructor.name, this.testSync.name], { keyDto, valueDto });
    return {
      key: keyDto.key,
      value: valueDto.value + 1,
    };
  }

  @MethodDecoratorArray('MethodDecoratorArrayData')
  public testSyncArray(
    @ParamKeyDto(`${ParamKeyDto.name}-data`)
    keyDto: DecoratorServiceParamKeyDto,
    @ParamValueDto(`${ParamValueDto.name}-data`)
    @ParamValueDtoMultiple(3)
    valueDto: DecoratorServiceParamValueDto,
  ): DecoratorServiceMethodEntity[] {
    console.info([this.constructor.name, this.testSyncArray.name], { keyDto, valueDto });
    return [
      {
        key: keyDto.key,
        value: valueDto.value + 1,
      },
      {
        key: keyDto.key,
        value: valueDto.value,
      },
    ];
  }

  @MethodDecorator('testAsync')
  public async testAsync(
    @ParamKeyDto(`${ParamKeyDto.name}-data`)
    keyDto: DecoratorServiceParamKeyDto,
    @ParamValueDto(`${ParamValueDto.name}-data`)
    @ParamValueDtoMultiple(3)
    valueDto: DecoratorServiceParamValueDto,
  ): Promise<DecoratorServiceMethodEntity> {
    console.info([this.constructor.name, this.testAsync.name], { keyDto, valueDto });
    return await new Promise((resolve) => {
      resolve({
        key: keyDto.key,
        value: valueDto.value + 1,
      });
    });
  }

  @MethodDecoratorArray('testSyncArray')
  public async testAsyncArray(
    @ParamKeyDto(`${ParamKeyDto.name}-data`)
    keyDto: DecoratorServiceParamKeyDto,
    @ParamValueDto(`${ParamValueDto.name}-data`)
    @ParamValueDtoMultiple(3)
    valueDto: DecoratorServiceParamValueDto,
  ): Promise<DecoratorServiceMethodEntity[]> {
    console.info([this.constructor.name, this.testAsyncArray.name], { keyDto, valueDto });
    return await new Promise((resolve) => {
      resolve([
        {
          key: keyDto.key,
          value: valueDto.value + 1,
        },
        {
          key: keyDto.key,
          value: valueDto.value,
        },
      ]);
    });
  }
}

export function runSync(): void {
  const decoratorServiceAsync = new DecoratorServiceClass();
  const keyDto: DecoratorServiceParamKeyDto = { key: 'key' };
  const valueDto: DecoratorServiceParamValueDto = { value: 1 };
  console.error(decoratorServiceAsync.testSync(keyDto, valueDto));
  // console.error(decoratorServiceAsync.testSyncArray(keyDto, valueDto));
}

export async function runAsync(): Promise<void> {
  const decoratorServiceAsync = new DecoratorServiceClass();
  const keyDto: DecoratorServiceParamKeyDto = { key: 'key' };
  const valueDto: DecoratorServiceParamValueDto = { value: 1 };
  console.error(await decoratorServiceAsync.testAsync(keyDto, valueDto));
  // console.error(await decoratorServiceAsync.testAsyncArray(dataDto, objectDto));
}
