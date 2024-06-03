import { IsNumber, IsString, ValidatorOptions } from 'class-validator';
import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer';
import { DataHelper, DecoratorService } from '../../src';
import { applyDecorators, Controller, Get, Param } from '@nestjs/common';

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
// const Decorator2 = new DecoratorService('__FA_DECORATOR_2__');
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
      // data: metadata,
      before: (metadata, ...args) => {
        // console.warn('BEFORE', args);
        // @ts-ignore
        return [args[0], { key: args[1].key + '-' + MethodDecorator.name }];
        // return args;
      },
    });
    return applyDecorators(Param)(target);
  });
};
const MethodDecorator2 = (metadata?: unknown): MethodDecorator => {
  // return Decorator.decorateMethod();
  // return applyDecorators(Get('path'));
  return Decorator.decorateMethod((target: object, propertyKey: string | symbol) => {
    DecoratorService.setMethodMetadata(Decorator.symbol, target, propertyKey, {
      data: metadata,
      after: (metadata, ...args) => {
        // console.warn('AFTER', args);
        // @ts-ignore
        return [args[0], { key: args[1].key + '-' + MethodDecorator2.name }];
        // return args;
      },
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
        const errors = DataHelper.validateSync(dto, VALIDATOR_CONFIG);
        if (dto instanceof Entity2) {
          // console.warn('ParamDecorator');
          dto.key += '-' + ParamDecorator.name;
        }
        return errors ? errors : dto;
      },
    });
  });
};
const ParamDecorator2 = (metadata?: unknown): ParameterDecorator => {
  return Decorator.decorateParameter((target, propertyKey, parameterIndex) => {
    DecoratorService.setParameterMetadata(Decorator.symbol, target, propertyKey, parameterIndex, {
      data: metadata,
      callback: (value, metadata) => {
        const dto = plainToInstance(metadata.parameterType as ClassConstructor<unknown>, value, TRANSFORMER_CONFIG);
        const errors = DataHelper.validateSync(dto, VALIDATOR_CONFIG);
        if (dto instanceof Entity2) {
          // console.warn('ParamDecorator2');
          dto.key += '-' + ParamDecorator2.name;
        }
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
  // console.log('DATA', { data });
  const result = mock.testEntityMethod({ ...data.entity1 }, { ...data.entity2 });
  console.log('RESULT', result);
}

@ClassDecorator('Class1')
class TestEntityClass {
  @Get()
  @MethodDecorator('Method1')
  // @MethodDecorator2('Method2')
  public testEntityMethod(
    // @ParamDecorator('Parameter1')
    entity1: Entity1,
    // entity2: Entity2,
    @ParamDecorator()
    @ParamDecorator2()
    entity2: Entity2,
  ): unknown[] {
    console.info('INCOME', { entity1, entity2 });
    // console.info('CONTEXT', `${this.constructor.name}->${this.testEntityMethod.name}()`);
    return [entity1, entity2];
  }
}
