import { IsNumber, IsString, ValidatorOptions } from 'class-validator';
import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer';
import { DataHelper, DecoratorService, ValidatorHelper } from '../../src';
import { applyDecorators, Controller, Param } from '@nestjs/common';

const TRANSFORMER_CONFIG: ClassTransformOptions = {
  enableImplicitConversion: false,
  exposeDefaultValues: false,
  exposeUnsetFields: true,
};
const VALIDATOR_CONFIG: ValidatorOptions = {
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  whitelist: true,
};

class Entity1 {
  @IsNumber()
  public key: number;
}

class Entity2 {
  @IsString()
  public key: string;
}

const Decorator = new DecoratorService('__FA_DECORATOR__');
/**
 *
 */
const ClassDecorator = (metadata?: unknown): ClassDecorator => {
  // return Decorator.decorateClass();
  // return applyDecorators(Controller());
  return Decorator.decorateClass((target: object) => {
    DecoratorService.setClassMetadata(Decorator.symbol, target, {
      data: metadata,
    });
    return applyDecorators(Controller())(target);
  });
};
const MethodDecorator = (metadata?: unknown): MethodDecorator => {
  // return Decorator.decorateMethod();
  // return applyDecorators(Get('path'));
  return Decorator.decorateMethod((target: object, propertyKey: string | symbol) => {
    DecoratorService.setMethodMetadata(Decorator.symbol, target, propertyKey, {
      data: metadata,
      // before: (value, metadata) => {
      // console.warn(value, metadata.classData);
      // },
    });
    return applyDecorators(Param)(target);
  });
};
const ParamDecorator = (metadata?: unknown): ParameterDecorator => {
  return Decorator.decorateParameter((target, propertyKey, parameterIndex) => {
    DecoratorService.setParameterMetadata(Decorator.symbol, target, propertyKey, parameterIndex, {
      data: metadata,
      callback: (value, metadata) => {
        const dto = plainToInstance(metadata.parameterType as ClassConstructor<unknown>, value, TRANSFORMER_CONFIG);
        const errors = ValidatorHelper.validateSync(dto, VALIDATOR_CONFIG);
        return errors ? errors : dto;
      },
    });
  });
};

export function decoratorEntityExample(): void {
  const mock = new TestEntityClass();
  const data = {
    entity1: { key: DataHelper.randomFloat(1, 10) },
    entity2: { key: DataHelper.randomString(10) },
    // entity2: { key: 123 },
  };
  const result = mock.testEntityMethod(data.entity1, data.entity2);
  console.log({ data, result });
}

@ClassDecorator('Class1')
class TestEntityClass {
  @MethodDecorator('Method1')
  public testEntityMethod(
    @ParamDecorator('Parameter1') entity1: Entity1,
    // entity2: Entity2,
    @ParamDecorator() entity2: Entity2,
  ): unknown[] {
    const result = [entity1, entity2];
    console.info(`${this.constructor.name}->${this.testEntityMethod.name}()`);
    return result;
  }
}
