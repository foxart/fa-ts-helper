import { IsNumber, IsString } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { ConsoleHelper, DataHelper, DecoratorHelper, ValidatorHelper } from '../../src';
import { applyDecorators, Controller, Param } from '@nestjs/common';

class Entity1 {
  @IsNumber()
  public key: number;
}

class Entity2 {
  @IsString()
  public key: string;
}

const Console = new ConsoleHelper({ info: false, link: false });
const Decorator = new DecoratorHelper('__FA_DECORATOR__');
/**
 *
 */
const ClassDecorator = (metadata?: unknown): ClassDecorator => {
  // return Decorator.decorateClass(metadata);
  return Decorator.decorateClass(metadata, (target: object) => {
    // return applyDecorators(Controller())(target);
    return ((target: object): void => {
      return applyDecorators(Controller())(target);
    })(target);
  });
};
const MethodDecorator = (metadata?: unknown): MethodDecorator => {
  // return Decorator.decorateMethod(null);
  // return applyDecorators(Get('path'));
  return Decorator.decorateMethod(
    metadata,
    (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      // return ((target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      console.warn('decorateMethod', target, propertyKey, descriptor);
      Console.stdout('\n');
      //   console.error(propertyKey);
      // })(target, propertyKey, descriptor);
      return applyDecorators(Param)(target);
      // return '';
    },
  );
};
const ParamDecorator = (data?: unknown): ParameterDecorator => {
  // return Decorator.decorateParameter();
  return Decorator.decorateParameter((value: Entity1, metadata) => {
    console.warn(metadata);
    // Console.stdout('\n');
    const dto = plainToInstance(metadata.parameterConstructor as ClassConstructor<unknown>, value);
    const errors = ValidatorHelper.validateSync(dto);
    return errors ? errors : dto;
  }, data);
};

@ClassDecorator('ClassMetadata1')
class MockClass {
  @MethodDecorator('MethodMetadata1')
  public testEntityMethod(
    @ParamDecorator('ParameterMetadata1') entity1: Entity1,
    entity2: unknown,
    // @Param() entity2: unknown,
  ): (Entity1 | Entity2)[] {
    console.log(`${this.constructor.name}.${this.testEntityMethod.name}`);
    Console.stdout('\n');
    return [entity1, entity2 as Entity2];
  }
}

export function testDecoratorEntity(): void {
  const mock = new MockClass();
  const entity1 = { key: DataHelper.randomFloat(1, 10) };
  const entity2 = { key: DataHelper.randomString(10) };
  console.info(mock.testEntityMethod(entity1, entity2));
}
